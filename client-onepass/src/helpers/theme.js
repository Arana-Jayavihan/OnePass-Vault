// color design tokens export
export const tokensDark = {
	grey: {
		0: "#ffffff", // manually adjusted
		10: "#f6f6f6", // manually adjusted
		50: "#f0f0f0", // manually adjusted
		100: "#e0e0e0",
		200: "#c2c2c2",
		300: "#a3a3a3",
		400: "#858585",
		500: "#666666",
		600: "#525252",
		700: "#3d3d3d",
		800: "#292929",
		900: "#141414",
		1000: "#000000", // manually adjusted
	},

	secondary: {
		100: "#e2dbff",
		200: "#c5b7ff",
		300: "#a792ff",
		400: "#8a6eff",
		500: "#6d4aff",
		600: "#573bcc",
		700: "#412c99",
		800: "#2c1e66",
		900: "#160f33"
	},
	primary: {
		100: "#cfcfcf",
		200: "#a0a0a0",
		300: "#707070",
		400: "#414141",
		500: "#111111",
		600: "#0e0e0e",
		700: "#0a0a0a",
		800: "#070707",
		900: "#030303"
	},
	yellow: {
		// yellow
		100: "#fdefcc",
		200: "#fcde99",
		300: "#face66",
		400: "#f9bd33",
		500: "#f7ad00",
		600: "#c68a00",
		700: "#946800",
		800: "#634500",
		900: "#312300"
	},
};

//   black: {
//       100: "#cfcfcf",
//       200: "#a0a0a0",
//       300: "#707070",
//       400: "#414141",
//       500: "#111111",
//       600: "#0e0e0e",
//       700: "#0a0a0a",
//       800: "#070707",
//       900: "#030303"
// },

// yellow: {
//     100: "#fdefcc",
//     200: "#fcde99",
//     300: "#face66",
//     400: "#f9bd33",
//     500: "#f7ad00",
//     600: "#c68a00",
//     700: "#946800",
//     800: "#634500",
//     900: "#312300"
// },



// function that reverses the color palette
function reverseTokens(tokensDark) {
	const reversedTokens = {};
	Object.entries(tokensDark).forEach(([key, val]) => {
		const keys = Object.keys(val);
		const values = Object.values(val);
		const length = keys.length;
		const reversedObj = {};
		for (let i = 0; i < length; i++) {
			reversedObj[keys[i]] = values[length - i - 1];
		}
		reversedTokens[key] = reversedObj;
	});
	return reversedTokens;
}
export const tokensLight = reverseTokens(tokensDark);

// mui theme settings
export const themeSettings = (mode) => {
	let pallette = {}
	if (mode === "dark") {
		pallette = {
			mode: 'dark',
			primary: {
				...tokensDark.primary,
				main: tokensDark.primary[400],
				light: tokensDark.primary[400],
			},
			secondary: {
				...tokensDark.secondary,
				main: tokensDark.secondary[300],
			},
			neutral: {
				...tokensDark.grey,
				main: tokensDark.grey[500],
			},
			background: {
				default: '#111111',
				alt: tokensDark.primary[500],
			}
		}
	}
	else {
		pallette = {
			mode: 'light',
			primary: {
				...tokensLight.primary,
				main: tokensDark.grey[50],
				light: tokensDark.grey[100],
			},
			secondary: {
				...tokensLight.secondary,
				main: tokensDark.secondary[600],
				light: tokensDark.secondary[700],
			},
			neutral: {
				...tokensLight.grey,
				main: tokensDark.grey[500],
			},
			background: {
				default: tokensDark.grey[0],
				alt: tokensDark.grey[50],
			}
		}
	}
	return {
		
		palette: pallette,
		typography: {
			fontFamily: ["Inter", "sans-serif"].join(","),
			fontSize: 12,
			h1: {
				fontFamily: ["Inter", "sans-serif"].join(","),
				fontSize: 40,
			},
			h2: {
				fontFamily: ["Inter", "sans-serif"].join(","),
				fontSize: 32,
			},
			h3: {
				fontFamily: ["Inter", "sans-serif"].join(","),
				fontSize: 24,
			},
			h4: {
				fontFamily: ["Inter", "sans-serif"].join(","),
				fontSize: 20,
			},
			h5: {
				fontFamily: ["Inter", "sans-serif"].join(","),
				fontSize: 16,
			},
			h6: {
				fontFamily: ["Inter", "sans-serif"].join(","),
				fontSize: 14,
			},
		},
	};
};
