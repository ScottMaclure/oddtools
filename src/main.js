import App from './App.svelte';
import appData from './data/app.json';
import ifData from './data/if.json';

const app = new App({
	target: document.body,
	props: {
		appData: appData,
		ifData: ifData
	}
});

export default app;