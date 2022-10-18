export function isTruthy(value: any): boolean {
	return !!value;
}

export function isFalsy(value: any): boolean {
	return !value;
}

export function equalOrIncludes(str1: string, str2: string): boolean {
	return str1 === str2 || str1.includes(str2) || str2.includes(str1);
}

export class TTRPGUtilitiesInternalError extends Error {
	constructor(message: string) {
		super(`[TTU_INTERNAL_ERROR - please report this error] ${message}`);
	}
}

export class TTRPGUtilitiesParsingError extends Error {
	constructor(message: string) {
		super(`[TTU_PARSING_ERROR] ${message}`);
	}
}
