const uniread = require("../uniread");

const blessed = require("blessed");
const contrib = require("blessed-contrib");

module.exports = (book) => {
	const player = {
		_speed: 250,
		_book: undefined,
		_current: 0,

		_screen: undefined,
		_text: undefined,
		_grid: undefined,
		_chapterList: undefined,

		_tick: undefined,

		_init: (book) => {
			player._screen = blessed.screen({debug: true});

			var grid = new contrib.grid({rows: 12, cols: 12, screen: player._screen});

			player._textBox = grid.set(0, 6, 2, 6, blessed.box, {
				label: "Book"
			});

			let chapters = book.links.map(link => link.name);

			player._chapterList = grid.set(0, 0, 11, 6, blessed.list, {
				style: {
					selected: {
						bg: "red"
					}
				},
				label: "Chapters",
				items: chapters,
				mouse: true
			});

			let help = grid.set(11, 0, 1, 12, blessed.text, {
				style: {
					selected: {
						bg: "red"
					}
				},
				label: "help",
			});

			help.append(blessed.text({label: "space pause | j/k Next/prev chapter | -/+ speed up/down | h/l rewind back/forward"}));

			player._text = blessed.text({
				label: "Book"
			});

			player._textBox.append(player._text);
	
			player._screen.key(["escape", "q", "C-c"], function() {
				return process.exit(0);
			});

			player._screen.key(["space"], function() {
				player.togglePlay();
			});

			player._screen.key(["j"], function() {
				player._chapterList.down();
			});

			player._screen.key(["k"], function() {
				player._chapterList.up();
			});

			player._screen.key(["-"], function() {
				player._speed += 10;
			});

			player._screen.key(["+"], function() {
				player._speed -= 10;
			});

			player._screen.key(["h"], function() {
				if(player._current > 0){
					player._current--;
				}

				player._draw();
			});

			player._screen.key(["l"], function() {
				player._current++;

				player._draw();
			});

			player._screen.render();

			player._book = book;

			player._chapterList.on("select item", (element, key) => {
				player._current = player._book.links[key].word;
			});

			player.togglePlay();
		},

		_draw: () => {
			player._text.setLabel(player._focusText(player._book.text[player._current]));
			player._screen.render();
		},

		_tickFunction: () => {
			player._tick = setTimeout(() => {
				player._draw();

				player._current++;

				player._tickFunction();
			}, player._speed);
		},

		_focusText: (text) => {
			let length = Math.ceil((7 - text.length) / 2);

			for(let i = length; i > 0; i--){
				text = " " + text;
			}

			return text+"\n   ^";
		},

		togglePlay: () => {
			if(player._tick !== undefined){
				clearTimeout(player._tick);
				player._tick = undefined;
			} else {
				player._tickFunction();
			}
		}
	};

	return player._init(book);
};

