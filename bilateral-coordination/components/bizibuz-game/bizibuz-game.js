const PARAMS = new URLSearchParams(document.location.search);
const LEVEL_INDEX = parseInt(PARAMS.get("d") || "0");
const LEVEL = LEVELS[LEVEL_INDEX];
const UID = PARAMS.get("uid");

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

		constructor() {
			super();
		}

		connectedCallback() {
			super.connectedCallback();

			this.#PADDLE_1 = this.querySelector(":scope > main > div.paddle-1");
			this.#PADDLE_2 = this.querySelector(":scope > main > div.paddle-2");
			this.#BALL = this.querySelector(":scope > main > img");
			this.#FIELD = this.querySelector(":scope > main");

			this.#PADDLE_1.style.height = LEVEL.paddleHeight + "vmin";
			this.#PADDLE_2.style.height = LEVEL.paddleHeight + "vmin";
			this.#PADDLE_1.style.marginTop = LEVEL.paddleHeight * -0.5 + "vmin";
			this.#PADDLE_2.style.marginTop = LEVEL.paddleHeight * -0.5 + "vmin";

			this.#ATTEMPTS_LEFT = LEVEL.maxAttempts;

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

			window.addEventListener(
				"keypress",
				() => {
					this.querySelector(":scope > header").addEventListener(
						"transitionend",
						() => {
							this.timesup();
							this.movepaddle();
							this.moveball();
						},
						{ once: true }
					);
					this.querySelector(":scope > header").classList.add("off");
				},
				{ once: true }
			);
		}

		movepaddle() {
			if (this.#D && this.#PADDLE_1_Y <= window.innerHeight / 2 - this.#PADDLE_1.clientHeight / 2) {
				this.#PADDLE_1_Y += LEVEL.paddleSpeed;
				this.#PADDLE_1.style.transform = `translateY(${this.#PADDLE_1_Y}px)`;
			}
			if (this.#E && this.#PADDLE_1_Y >= 0 - window.innerHeight / 2 + this.#PADDLE_1.clientHeight / 2) {
				this.#PADDLE_1_Y -= LEVEL.paddleSpeed;
				this.#PADDLE_1.style.transform = `translateY(${this.#PADDLE_1_Y}px)`;
			}
			if (this.#J && this.#PADDLE_2_Y <= window.innerHeight / 2 - this.#PADDLE_2.clientHeight / 2) {
				this.#PADDLE_2_Y += LEVEL.paddleSpeed;
				this.#PADDLE_2.style.transform = `translateY(${this.#PADDLE_2_Y}px)`;
			}
			if (this.#I && this.#PADDLE_2_Y >= 0 - window.innerHeight / 2 + this.#PADDLE_2.clientHeight / 2) {
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

			if (this.#BALL_X <= 0 - window.innerWidth / 2 - this.#BALL.clientWidth) {
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

			if (this.#BALL_X >= window.innerWidth / 2 + this.#BALL.clientWidth) {
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
				this.end();
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
	}
);
