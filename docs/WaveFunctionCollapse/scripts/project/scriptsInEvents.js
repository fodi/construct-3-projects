import OverlappingModel from './vendor/kchapellier/wavefunctioncollapse/overlapping-model.js';

function xmur3(str) {
    // String based seed generator based on MurmurHash3's mixing function.
    // Copied from:
    // https://github.com/bryc/code/blob/master/jshash/PRNGs.md
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
                h = h << 13 | h >>> 19;
    return function () {
        h = Math.imul(h ^ h >>> 16, 2246822507),
                h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}

function mulberry32(a) { // 
    // A very fast 2^32 internal state PRNG function.
    // Copied from:
    // https://github.com/bryc/code/blob/master/jshash/PRNGs.md
    return function () {
        a |= 0;
        a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

const sourceImages = {
    // theese are some of the original images from http://www.kchapelier.com/wfc-example/overlapping-model.html
    office: {
        defaultPatternSize: 3,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPAQMAAAABGAcJAAAABlBMVEX///8AAABVwtN+AAAALElEQVQI12P4/4+hQQCE/n1gaAEyGEBk+y+GFgeGBgcQef8AQ4cDQwcDkAQAWD4ONDCvKXEAAAAASUVORK5CYII='
    },
    rooms: {
        defaultPatternSize: 3,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEX///8AAABVwtN+AAAALElEQVQI12N4/53hfSNDMxg1MDIwN4AY94HoPQgdOMzAcIDhADOIceA7UDEA1L8Uiac/7pQAAAAASUVORK5CYII='
    },
    roomsRedBlue: {
        defaultPatternSize: 3,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUA/9D/AAD3z/M3AAAALElEQVQI12N4/53hfSNDMxg1MDIwN4AY94HoPQgdOMzAcIDhADOIceA7UDEA1L8Uiac/7pQAAAAASUVORK5CYII='
    },
    fewerRooms: {
        defaultPatternSize: 3,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEUAAAD///+l2Z/dAAAALElEQVQI12MQYGCQqWNgASP7fwwP6hkU6sBIAITs5Rj+CzPYf2CwZwAioGIA5zwJE+eJGywAAAAASUVORK5CYII='
    },
    lateralMaze: {
        defaultPatternSize: 3,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOAQMAAAAlhr+SAAAABlBMVEX///8AAABVwtN+AAAAK0lEQVQI12MAgvo/DA4MDPF/GAJYGMK/MISIMISGQJGjCEN9CANDCEP9HQDLsgnwFPrQ/QAAAABJRU5ErkJggg=='
    },
    simpleWall: {
        defaultPatternSize: 3,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARAQMAAAABo9W5AAAABlBMVEX///8AAABVwtN+AAAAIElEQVQI12NgYmIA4///GxgEOBjQMES8wYEBDYPFYXoBbQwLw1TvjtYAAAAASUVORK5CYII='
    },
    simpleMaze: {
        defaultPatternSize: 2,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAEAQMAAACTPww9AAAABlBMVEX///8AAABVwtN+AAAAEElEQVQI12NgYChgCGAoAAADmAExJ4nafQAAAABJRU5ErkJggg=='
    },
    simpleKnot: {
        defaultPatternSize: 3,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALAgMAAADUwp+1AAAACVBMVEX///8AAAD9/f2hU1iPAAAAIElEQVQI12MAA9EABgYBAQhWEGAQDQ1gEFCACYGlQQAANE4CZfcvTRoAAAAASUVORK5CYII='
    },
    paths: {
        defaultPatternSize: 3,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARAQMAAAABo9W5AAAABlBMVEX///8AAABVwtN+AAAAM0lEQVQI12NwKGBgcHBAYOd/DAx1TAwMR5gbGFgYGOCY/QOQFmBg+CPfwCAApGG4QIABAFFPCMsV+4VfAAAAAElFTkSuQmCC'
    }
};

function generateWFCMap(constructRuntime, inputImageName, outputWidth, outputHeight,
        seedString = '', inputPatternSize = 0,
        isInputPeriodic = false, isOutputPeriodic = false, symmetryLevel = 8,
        maxAttempts = 1) {

    const image = new Image();

    image.onload = function () {

        let canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        const model = new OverlappingModel(
                imageData.data,
                Math.sqrt(imageData.data.length / 4),
                Math.sqrt(imageData.data.length / 4),
                inputPatternSize > 0 ? inputPatternSize : sourceImages[inputImageName].defaultPatternSize,
                outputWidth, outputHeight,
                isInputPeriodic,
                isOutputPeriodic,
                symmetryLevel);

        let finished = false;
        let attempt = 0;

        // check if there's a seed string set
        do {
            attempt++;
            console.info('Attempt ' + attempt + '/' + maxAttempts);
            if (seedString.length > 0) {

                console.info('Generating with seed string: ' + seedString);

                // generate seed from seed string
                const seed = xmur3(seedString);

                // initialize custom random function
                const myRandom = mulberry32(seed());

                finished = model.generate(myRandom);

            } else { // if no seed string was specified, run with random seed

                console.info('Generating without seed string...');

                finished = model.generate(null);

            }
        } while (!finished && attempt < maxAttempts);

        if (finished) {

            console.info('Generation succeeded.');

            const canvasOutput = document.createElement('canvas');
            canvasOutput.width = outputWidth;
            canvasOutput.height = outputHeight;
            const canvasOutputContext = canvasOutput.getContext('2d');
            const imgData = canvasOutputContext.createImageData(outputWidth, outputHeight);

            const result = model.graphics(imgData.data);

            canvasOutputContext.putImageData(imgData, 0, 0);

            const finalData = canvasOutputContext.getImageData(0, 0, outputWidth, outputHeight);

            console.info(canvasOutput.toDataURL("image/png")); // log a clickable image URL to the console

            const arr = constructRuntime.objects.MapArray.getFirstInstance();

            arr.setSize(finalData.data.length / 4);

            for (let i = 0, j = 0; i <= finalData.data.length - 1; i += 4, j++) {
                arr.setAt(constructRuntime.callFunction("getC3ColorInt", finalData.data[i], finalData.data[i + 1], result[i + 2], finalData.data[i + 3]), j); // save rgba value using C3's internal function

            }

            constructRuntime.callFunction("onWFCMapGenerationFinished", true);

        } else {
            console.error('Generation failed.');

            constructRuntime.callFunction("onWFCMapGenerationFinished", false);
        }

        // remove canvas element from document
        canvas = null;

    };

    if (sourceImages.hasOwnProperty(inputImageName)) {
        image.src = sourceImages[inputImageName].data;
    } else {
        console.error('Unknown pattern name: ' + inputImageName);
}


}


const scriptsInEvents = {

	async ["Fwfc🌊_Event1_Act1"](runtime, localVars)
	{
		generateWFCMap(runtime, localVars.inputImageName, localVars.outputWidth, localVars.outputHeight, localVars.seedString, localVars.inputPatternSize, localVars.isInputPeriodic > 0, localVars.isOutputPeriodic > 0, localVars.symmetryLevel, localVars.maxAttempts)
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

