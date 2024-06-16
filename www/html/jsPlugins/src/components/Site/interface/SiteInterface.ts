import { SiteArrayWithIdType } from "../../../dbService/models/Site";

interface SiteProps {
	sites: 		SiteArrayWithIdType;
	total: 		number,
	page: 		number,
	pageSize: 	number,
}

export type {SiteProps};