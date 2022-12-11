import { EnclosingPair, ParserUtils } from '@opd-libs/opd-utils-lib/lib/ParserUtils';
import { TTRPGUtilitiesParsingError } from './Utils';

export interface MarkdownLink {
	isEmbed: boolean;
	target: string;
	block: string;
	alias: string;
}

export function parseMdLink(link: string): MarkdownLink {
	if (!link) {
		throw new TTRPGUtilitiesParsingError('invalid link, link is empty');
	}

	const mdLink: MarkdownLink = {} as MarkdownLink;
	mdLink.isEmbed = link.startsWith('!');
	const linkContent = ParserUtils.getInBetween(link, new EnclosingPair('[[', ']]'));

	if (!linkContent) {
		throw new TTRPGUtilitiesParsingError('invalid link, link is empty');
	}

	if (typeof linkContent !== 'string') {
		throw new TTRPGUtilitiesParsingError('invalid link, link format is invalid');
	}

	const linkParts = linkContent.split('|');
	if (linkParts.length === 2) {
		mdLink.alias = linkParts[1];
	} else if (linkParts.length > 2) {
		throw new TTRPGUtilitiesParsingError("invalid link, link may only contain a maximum of one '|'");
	}

	const targetParts = linkParts[0].split('#');
	if (targetParts.length === 1) {
		mdLink.target = targetParts[0];
	} else if (targetParts.length === 2) {
		mdLink.target = targetParts[0];
		mdLink.block = targetParts[1];
	} else {
		throw new TTRPGUtilitiesParsingError("invalid link, link target may only contain a maximum of one '#'");
	}

	return mdLink;
}

export function isMdLink(str: string): boolean {
	return (str.startsWith('![[') || str.startsWith('[[')) && str.endsWith(']]');
}
