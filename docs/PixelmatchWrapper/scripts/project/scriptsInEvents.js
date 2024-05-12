import pixelmatch from './vendor/pixelmatch/pixelmatch-5.3.0.module.js';


const scriptsInEvents = {

	async Pixelmatch_Event1_Act1(runtime, localVars)
	{
		const successFunctionName = localVars.successFunctionName;
		const failFunctionName = localVars.failFunctionName;
		
		try {
			const ci1 = runtime.getInstanceByUid(localVars.canvasUID1);
			const ci2 = runtime.getInstanceByUid(localVars.canvasUID2);
			const ipd1 = await ci1.getImagePixelData();
			const ipd2 = await ci2.getImagePixelData();
			const mpc = pixelmatch(ipd1.data, ipd2.data, null, ipd1.width, ipd1.height);
			runtime.callFunction(successFunctionName, mpc);
		} catch(error) {
			console.error("[PIXELMATCH_startComparison] Something went wrong:");
			console.error(error);
			runtime.callFunction(failFunctionName);
		}
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

