var bar = require('./bar');

exports.silentlyFailsWithoutNullDependency = function (input) {
	// Mis-typed parameter check.
	if (/[0-8]/.test(input)) {
		return false;
	}

	// Call another function that does a different verification step,
	// returning the same result as the original function call. 
	// We could manually stub this out to function () { throw "Whatever."; }
	// however, this would be much more code over time, and to do this for every
	// function on every dependency would take a long time.
	if (bar.bar(input) === 'bar') {
		return false;
	}

	// other stuff.
};

exports.nullNonSideEffectDependency = function (input) {
	// Allow non-proxied calls to a function that has no effect,
	// such as a logging or middleware call.
	bar.bar(input);

	// Parameter check.
	return /[0-9]/.test(input);
};