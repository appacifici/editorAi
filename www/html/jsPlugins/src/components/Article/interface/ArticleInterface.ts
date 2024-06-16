import { ArticleArrayWithIdType } from "../../../dbService/models/Article";

interface ArticleProps {
	articles: 	ArticleArrayWithIdType;
	total: 		number,
	page: 		number,
	pageSize: 	number,
}

export type {ArticleProps};