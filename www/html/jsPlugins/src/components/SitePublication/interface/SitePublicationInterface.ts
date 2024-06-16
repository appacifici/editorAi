import { SitePublicationArrayWithIdType } from "../../../dbService/models/SitePublication";

interface SitePublicationProps {
	sitePublications: 		SitePublicationArrayWithIdType;
	total: 		number,
	page: 		number,
	pageSize: 	number,
}

export type {SitePublicationProps};