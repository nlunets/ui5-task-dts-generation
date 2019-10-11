const ts = require("typescript");

function compile(fileName, fileContent, dependencies) {
	const orgRead = ts.sys.readFile;
	ts.sys.readFile = function (fileToRead) {
		if(fileToRead === fileName) {
			return fileContent;
		}
		else {
			return orgRead.apply(this, arguments);
		}
	};

	const options = {
		noEmitOnError: true,
		noImplicitAny: true,
		target: ts.ScriptTarget.ES5,
		module: ts.ModuleKind.CommonJS,
		types: dependencies.map((dependency) => `@openui5/${dependency}`)
	};
	let program = ts.createProgram([fileName], options);
	let emitResult = program.emit();

	let allDiagnostics = ts
		.getPreEmitDiagnostics(program)
		.concat(emitResult.diagnostics);

	allDiagnostics.forEach(diagnostic => {
		if (diagnostic.file) {
			let {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
			let message = ts.flattenDiagnosticMessageText(
				diagnostic.messageText,
				"\n"
			);
			console.log(
				`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
			);
		} else {
			console.log(
				`${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
			);
		}
	});

	return emitResult.emitSkipped ? 1 : 0;
}

module.exports = compile;