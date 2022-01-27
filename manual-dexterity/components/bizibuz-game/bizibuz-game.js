const PARAMS = new URLSearchParams(document.location.search);
const LEVEL_INDEX = parseInt(PARAMS.get("d") || "0");
const LEVEL = LEVELS[LEVEL_INDEX];
const UID = PARAMS.get("uid");
const STEP_BEFORE_PLAY = 'step-before-play';
const STEP_INSTRUCTIONS = 'step-instructions';
const STEP_PLAY = 'step-play';
const STEP_AFTER_TRIAL = 'step-after-trial';
const STEP_AFTER_PLAY = 'step-after-play';
const STEP_PLAY_FINAL = 'step-play-final';
const STEP_AFTER_FINAL = 'step-after-final';
var currentStep;

window.customElements.define(
	"bizibuz-game",
	class extends ImportElement {
		#ATTEMPTS_LEFT = 0;

		#MAX_BOUNCE = 0;
		#CURRENT_BOUNCE = 0;
		#START_TIME;
		#END_TIME;

		#PADDLE_1_Y = 0;
		#PADDLE_2_Y = 0;
		#BALL_X = 0;
		#BALL_Y = 0;
		#BALL_RADIAN = -0.5 * Math.PI + ((Math.random() - 0.5) / 2) * Math.PI;
		#JUST_BOUNCE = false;
		#TIMESUP = false;
		#HISTORY = [];
		#TIMESUP_HANDLER = 0;
		

		#D = false;
		#E = false;
		#J = false;
		#I = false;

		#PADDLE_1;
		#PADDLE_2;
		#BALL;
		#FIELD;

		MAP_WIDTH = 400;
		MAP_HEIGHT = 280;

		constructor() {
			super();
		}

		connectedCallback() {
			super.connectedCallback();

			this.#PADDLE_1 = this.querySelector(":scope > main > #game-area > div.paddle-1");
			this.#PADDLE_2 = this.querySelector(":scope > main > #game-area > div.paddle-2");
			this.#BALL = this.querySelector(":scope > main > #game-area > img");
			this.#FIELD = this.querySelector(":scope > main > #game-area");

			this.#PADDLE_1.style.height = LEVEL.paddleHeight + "vmin";
			this.#PADDLE_2.style.height = LEVEL.paddleHeight + "vmin";
			this.#PADDLE_1.style.marginTop = LEVEL.paddleHeight * -0.5 + "vmin";
			this.#PADDLE_2.style.marginTop = LEVEL.paddleHeight * -0.5 + "vmin";

			this.#ATTEMPTS_LEFT = LEVEL.maxAttempts;

			// this.setupStepBeforePlay();
			// this.setupStepPlay();
			// this.setupStepAfterTrial();
			this.setupStepInstructions();
		}

		movepaddle() {
			if (this.#D && this.#PADDLE_1_Y <= this.MAP_HEIGHT / 2 - this.#PADDLE_1.clientHeight / 2) {
				this.#PADDLE_1_Y += LEVEL.paddleSpeed;
				this.#PADDLE_1.style.transform = `translateY(${this.#PADDLE_1_Y}px)`;
			}
			if (this.#E && this.#PADDLE_1_Y >= 0 - this.MAP_HEIGHT / 2 + this.#PADDLE_1.clientHeight / 2) {
				this.#PADDLE_1_Y -= LEVEL.paddleSpeed;
				this.#PADDLE_1.style.transform = `translateY(${this.#PADDLE_1_Y}px)`;
			}
			if (this.#J && this.#PADDLE_2_Y <= this.MAP_HEIGHT / 2 - this.#PADDLE_2.clientHeight / 2) {
				this.#PADDLE_2_Y += LEVEL.paddleSpeed;
				this.#PADDLE_2.style.transform = `translateY(${this.#PADDLE_2_Y}px)`;
			}
			if (this.#I && this.#PADDLE_2_Y >= 0 - this.MAP_HEIGHT / 2 + this.#PADDLE_2.clientHeight / 2) {
				this.#PADDLE_2_Y -= LEVEL.paddleSpeed;
				this.#PADDLE_2.style.transform = `translateY(${this.#PADDLE_2_Y}px)`;
			}
			window.requestAnimationFrame(() => {
				this.movepaddle();
			});
		}

		moveball() {
			if (this.#TIMESUP) {
				return;
			}

			this.#BALL_X += LEVEL.ballSpeed * Math.sin(this.#BALL_RADIAN);
			this.#BALL_Y += LEVEL.ballSpeed * Math.cos(this.#BALL_RADIAN);

			if (!this.#JUST_BOUNCE && this.#BALL_X <= 0 - this.#FIELD.clientWidth / 2 + this.#BALL.clientWidth && this.#BALL_X >= 0 - this.#FIELD.clientWidth / 2) {
				if (this.#BALL_Y >= this.#PADDLE_1_Y - this.#PADDLE_1.clientHeight / 2 - this.#BALL.clientHeight && this.#BALL_Y <= this.#PADDLE_1_Y + this.#PADDLE_1.clientHeight / 2 + this.#BALL.clientHeight) {
					this.#JUST_BOUNCE = true;
					this.#CURRENT_BOUNCE++;
					this.#MAX_BOUNCE = Math.max(this.#MAX_BOUNCE, this.#CURRENT_BOUNCE);
					setTimeout(() => {
						this.#JUST_BOUNCE = false;
					}, 1000);
					this.#BALL_RADIAN = Math.PI * 2 - this.#BALL_RADIAN;
				}
			}

			if (this.#BALL_X <= 0 - this.MAP_WIDTH / 2 - this.#BALL.clientWidth) {
				this.over();
				return;
			}

			if (!this.#JUST_BOUNCE && this.#BALL_X >= this.#FIELD.clientWidth / 2 - this.#BALL.clientWidth && this.#BALL_X <= this.#FIELD.clientWidth / 2) {
				if (this.#BALL_Y >= this.#PADDLE_2_Y - this.#PADDLE_2.clientHeight / 2 - this.#BALL.clientHeight && this.#BALL_Y <= this.#PADDLE_2_Y + this.#PADDLE_2.clientHeight / 2 + this.#BALL.clientHeight) {
					this.#JUST_BOUNCE = true;
					this.#CURRENT_BOUNCE++;
					this.#MAX_BOUNCE = Math.max(this.#MAX_BOUNCE, this.#CURRENT_BOUNCE);
					setTimeout(() => {
						this.#JUST_BOUNCE = false;
					}, 1000);
					this.#BALL_RADIAN = Math.PI * 2 - this.#BALL_RADIAN;
				}
			}

			if (this.#BALL_X >= this.MAP_WIDTH / 2 + this.#BALL.clientWidth) {
				this.over();
				return;
			}

			if (this.#BALL_Y <= 0 - this.#FIELD.clientHeight / 2 + this.#BALL.clientHeight / 3) {
				// Hit Top
				this.#BALL_RADIAN = Math.PI - this.#BALL_RADIAN;
			}
			if (this.#BALL_Y >= this.#FIELD.clientHeight / 2 - this.#BALL.clientHeight / 3) {
				// Hit Bottom
				this.#BALL_RADIAN = Math.PI - this.#BALL_RADIAN;
			}
			this.#BALL.style.transform = `translateX(${this.#BALL_X}px) translateY(${this.#BALL_Y}px)`;
			window.requestAnimationFrame(() => {
				this.moveball();
			});
		}

		over() {
			clearTimeout(this.#TIMESUP_HANDLER);
			this.#END_TIME = new Date();
			this.#HISTORY.push({
				start_time: this.#START_TIME,
				end_time: this.#END_TIME,
				bounce: this.#CURRENT_BOUNCE
			});
			this.#BALL.style.transform = null;
			this.#BALL_X = 0;
			this.#BALL_Y = 0;
			this.#BALL_RADIAN = Math.PI / 4 - Math.PI / 2;
			this.#BALL.classList.add("off");
			this.#ATTEMPTS_LEFT--;
			if (this.#ATTEMPTS_LEFT <= 0) {
				// this.end();
				if (currentStep == STEP_PLAY) {
					this.setupStepAfterTrial();
				} else {
					this.setupStepAfterFinal();
				}
				return;
			} else {
				setTimeout(() => {
					this.#BALL.classList.remove("off");
					setTimeout(() => {
						this.timesup();
						this.moveball();
					}, 1000);
				}, 1000);
			}
		}

		timesup() {
			this.#TIMESUP = false;
			this.#CURRENT_BOUNCE = 0;
			this.#START_TIME = new Date();
			this.#TIMESUP_HANDLER = setTimeout(() => {
				this.#TIMESUP = true;
				this.over();
			}, LEVEL.maxTimeInSeconds * 1000);
		}

		end() {
			this.querySelector(":scope > footer").classList.remove("off");
			fetch("https://example.com", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					max_bounce: this.#MAX_BOUNCE,
					history: this.#HISTORY,
					uid: UID
				})
			});
		}

		play() {
			this.setupStepInstructions();
		}
		
		playAudio() {
			var audio = new Audio('./assets/instruction_en.mp4');
			audio.play();
			audio.addEventListener("ended", () => {
				audio.currentTime = 0;
				this.endInstruction();
			})
		}
		
		playGif() {
			var footballGif = document.getElementById('football_gif');
			var keyboardGif = document.getElementById('keyboard_gif');
			footballGif.src = "./assets/football.gif" + "?a=" + Math.random();
			keyboardGif.src = "./assets/keyboard.gif" + "?a=" + Math.random();
		}
		
		endInstruction() {
			var instructionTxt = document.getElementById('instruction_txt');
			instructionTxt.classList.add('hidden');
			
			var instructionEndTxt = document.getElementById('instruction_end_txt');
			if (instructionEndTxt.classList.contains('hidden')) {
				instructionEndTxt.classList.remove('hidden');
				setTimeout(function () {
					instructionEndTxt.classList.remove('visuallyhidden');
				}, 20);
			} else {
				instructionEndTxt.classList.add('visuallyhidden');    
				instructionEndTxt.addEventListener('transitionend', function(e) {
					instructionEndTxt.classList.add('hidden');
				}, {
					capture: false,
					once: true,
					passive: false
				});
			}
		
			this.setupPressEventListenerToPlay()
		}

		setupKeyEventListenerToPlay() {
			window.addEventListener("keydown", (e) => {
				switch (e.code) {
					case "KeyD":
						this.#D = true;
						break;
					case "KeyE":
						this.#E = true;
						break;
					case "KeyJ":
						this.#J = true;
						break;
					case "KeyI":
						this.#I = true;
						break;
				}
			});
			window.addEventListener("keyup", (e) => {
				switch (e.code) {
					case "KeyD":
						this.#D = false;
						break;
					case "KeyE":
						this.#E = false;
						break;
					case "KeyJ":
						this.#J = false;
						break;
					case "KeyI":
						this.#I = false;
						break;
				}
			});
		}

		setupPressEventListenerToPlay() {
			window.addEventListener(
				"keypress",
				() => {
					this.setupStepPlay()
				},
				{ once: true }
			);
		}

		showStep(step) {
			currentStep = step;

			document.getElementById(STEP_BEFORE_PLAY).classList.add('hidden');
			document.getElementById(STEP_INSTRUCTIONS).classList.add('hidden');
			document.getElementById(STEP_PLAY).classList.add('hidden');
			document.getElementById(STEP_AFTER_PLAY).classList.add('hidden');
			document.getElementById(STEP_AFTER_TRIAL).classList.add('hidden');

			switch (step) {
				case STEP_PLAY_FINAL:
					document.getElementById(STEP_PLAY).classList.remove('hidden');
					break;
				default:
					document.getElementById(step).classList.remove('hidden');
					break;
			}
		}

		setupStepBeforePlay() {
			this.showStep(STEP_BEFORE_PLAY)
			document.getElementById('btn-play').addEventListener('click', () => { this.play() });
		}

		setupStepInstructions() {
			this.showStep(STEP_INSTRUCTIONS)
			this.playAudio();
			this.playGif();
		}

		setupStepPlay() {
			this.showStep(STEP_PLAY)
			this.setupKeyEventListenerToPlay();
			this.timesup();
			this.movepaddle();
			this.moveball();
		}

		setupStepAfterTrial() {
			this.showStep(STEP_AFTER_TRIAL)
			document.getElementById('btn-play-final').addEventListener('click', () => {this.setupStepPlayFinal()})
		}

		setupStepPlayFinal() {
			this.showStep(STEP_PLAY_FINAL)
			this.#ATTEMPTS_LEFT = 1;
			setTimeout(() => {
				this.#BALL.classList.remove("off");
				setTimeout(() => {
					this.timesup();
					this.moveball();
				}, 1000);
			}, 1000);
		}

		setupStepAfterFinal() {
			this.showStep(STEP_AFTER_FINAL)
			document.getElementById('btn-next-game').addEventListener('click', () => {
        this.nextGame();
    	});
		}

		nextGame() {
			window.parent.nextGame();
		}
	}
);