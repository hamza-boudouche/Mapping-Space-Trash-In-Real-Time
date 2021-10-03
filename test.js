const axios = require('axios').default;

(async () => {
	axios.get('https://celestrak.com/NORAD/elements/gp.php?CATNR=34542&FORMAT=TLE')
		.then((response) => console.log(response.data))
})()