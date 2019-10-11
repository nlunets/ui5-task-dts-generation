const Resource = require("@ui5/fs").Resource;
const {jsonToDTS} = require("@ui5/dts-generator");

// Currently using same shared directives for all libraries
const {badInterfaces, badMethods} = require("./directives/excluded-elements");
const {typeTyposMap} = require("./directives/typos");
const {
	namespacesToInterfaces
} = require("./directives/namespaces-to-interfaces");
const {fqnToIgnore} = require("./directives/ts-ignore");

const directives = {
	badMethods: badMethods,
	badInterfaces: badInterfaces,
	typeTyposMap: typeTyposMap,
	namespacesToInterfaces: namespacesToInterfaces,
	fqnToIgnore
};

const libraryNameRegExp = /<libraryName>([^<]+)<\/libraryName>/g;

const ts = require('typescript');

/**
 * Task to transpiles ES6 code into ES5 code.
 *
 * @param {Object} parameters Parameters
 * @param {DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {Object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @returns {Promise<undefined>} Promise resolving with undefined once data has been written
 */
module.exports = function ({workspace, dependencies, options}) {
	return workspace.byGlob(["/**/designtime/api.json"]).then(resources => {
		return workspace.byGlob(["**/.library"]).then(libraryFile => {
			return libraryFile[0].getString().then((libraryFileContent) => {
				return Promise.all(resources.map((resource) => {
					const matches = libraryFileContent.match(libraryNameRegExp);
					return resource.getString().then(value => {
						const libJsonData = JSON.parse(value);
						const dependencies = matches.map((match) => {
							return /<libraryName>([^<]+)<\/libraryName>/.exec(match)[1]
						});
						const libDTSResult = jsonToDTS(libJsonData, {
							directives,
							dependencies: dependencies
						});

						if(options.configuration && options.configuration.validateFile) {
							const compiler = require('./tsCompiler');
							const exitCode = compiler(options.projectName + ".d.ts", libDTSResult.dtsText, dependencies);
							if(exitCode === 1 && options.configuration.strictMode) {
								return Promise.reject("Errors while generating the definition file")
							}
						}

						const dtsResource = new Resource({
							path: '/' + options.projectName + ".d.ts",
							string: libDTSResult.dtsText
						});

						workspace.write(dtsResource);
					})
				}));
			});
		});
	});
};
