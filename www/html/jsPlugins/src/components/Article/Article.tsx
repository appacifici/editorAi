import React, { useEffect, useState } 				from 'react';
import axios 										from 'axios';
import { useRouter } 								from 'next/router';
import Container 									from 'react-bootstrap/Container';
import { Modal, Button, 
	Pagination, Form, Row, Col, Spinner } 			from 'react-bootstrap';

import { ArticleWithIdType } 						from '../../dbService/models/Article';
import { handleCreate, handleDelete, 
	handlePagination, handleSubmitFormParams,
	handleUpdate } 									from '../../services/globalNext';
import { ArticleProps } 							from './interface/ArticleInterface';
import articleStyle 								from './article.module.scss';
import { 
	SitePublicationArrayWithIdType, 
	SitePublicationWithIdType 
} 													from '../../dbService/models/SitePublication';
import { SiteArrayWithIdType } 						from '../../dbService/models/Site';
import { PromptAiArrayWithIdType } 					from '../../dbService/models/PromptAi';
import "react-datepicker/dist/react-datepicker.css";
import { BACKEND_ENDPOINT } from '../../constants';


const ArticleComponent: React.FC<ArticleProps> = ({ articles, total, page, pageSize }) => {
	const router 											= useRouter();
	const { query } 										= router; 
	const [show, setShow] 									= useState<boolean>(false);
	const [resp, setResponse]								= useState<string|null>(null);
	const [articleData, setArticleData]						= useState<ArticleWithIdType|null>(null);	
	const [sitePublicationData, setSitePublicationData]   	= useState<SitePublicationArrayWithIdType|null>(null);
	const [siteData, setSiteData]   						= useState<SiteArrayWithIdType|null>(null);
	const [promptsAi, setPromptsAi]   						= useState<PromptAiArrayWithIdType|null>(null);
	const [selectedPromptId, setSelectedPromptId] 			= useState<string>('');
	const [promptCalls, setCalls] 							= useState<object|null>(null);
	const [showTestBtn, setShowTestBtn] 					= useState<boolean>(true);
	const [showPublishBtn, setShowPublishBtn] 				= useState<boolean>(true);
	const [bodyGpt, setBodyGpt] 							= useState<string>('');
	const [editor, setEditor] 								= useState(null);
	const [categoryWP, setCatWp] 							= useState<string>(''); 
	const [userWP, setUserWP] 								= useState<string>(''); 
	const [generateGpt, setGenerateGpt] 					= useState<string>(''); 
	const [sendWP, setSendWP] 								= useState<string>(''); 


	const handleClose 				= () => { setShow(false); window.location.reload(); };
	const handleShow 				= async (id?: string|null) => {
		try {
			if( id !== null ) {
				const response:any 					= await axios.get(`${BACKEND_ENDPOINT}/api/article/${id}`);
				const articleWithIdType:ArticleWithIdType = response.data;				
				setArticle(articleWithIdType);

				const responseSP:any = await axios.get(`${BACKEND_ENDPOINT}/api/sitePublication/${articleWithIdType.sitePublication._id}
				`);
				const sitePublicationArrayWithIdType:SitePublicationWithIdType = responseSP.data;

				getAllPromptSitePub(sitePublicationArrayWithIdType.sitePublication);
			} else {
				setArticleData(null);
			}
			await getAllSitePubblication();
			await getAllSite();			
			setShow(true);
		} catch (error) {
			console.error('Errore durante il recupero dei dati dell\'article:', error);			
		}
	}

	const setArticle = (articleWithIdType:ArticleWithIdType)  => {
		setArticleData(articleWithIdType);
		setCatWp(articleWithIdType.categoryPublishSite.toString());
		setUserWP(articleWithIdType.userPublishSite.toString());
		setGenerateGpt(articleWithIdType.genarateGpt.toString());
		setSendWP(articleWithIdType.send.toString());
	}

	const handleInputChangeCatWP = (event:any, field:string) => {
		switch( field ) {
			case 'setCatWP': 
				setCatWp(event.target.value);
			break;
			case 'setUserWP': 
				setUserWP(event.target.value);
			break;
			case 'setGenerateGpt': 
				setGenerateGpt(event.target.value);
			break;
			case 'setSendWP': 
				setSendWP(event.target.value);
			break;
		}
	};

	useEffect(() => {
        if (typeof window !== "undefined") {  // Assicura che il codice venga eseguito solo sul lato client
            import('@ckeditor/ckeditor5-react').then(CKEditorModule => {
                import('@ckeditor/ckeditor5-build-classic').then(ClassicEditorModule => {
                    setEditor({
                        CKEditor: CKEditorModule.CKEditor, // CKEditor component
                        ClassicEditor: ClassicEditorModule.default // ClassicEditor build
                    });
                });
            });
        }
    }, []);

	useEffect(() => {
		getAllSitePubblication();
		getAllSite();
	}, []); 
	
	const handleSelectionChange = async (event:any) => {
		if( !event.target.value ) {
			return false;
		}
		setSelectedPromptId(event.target.value);
		const promptAiResp:any = await axios.get(`${BACKEND_ENDPOINT}/api/promptAi/${event.target.value}`);
		setCalls(promptAiResp.data.calls);
	};

	const getAllSitePubblication = async () => {
		const responseSP:any = await axios.get(`${BACKEND_ENDPOINT}/api/sitePublication`);
		const sitePublicationArrayWithIdType:SitePublicationArrayWithIdType = responseSP.data;
		setSitePublicationData(sitePublicationArrayWithIdType);
	}

	const getAllSite = async () => {
		const responseSP:any = await axios.get(`${BACKEND_ENDPOINT}/api/site`);
		const siteArrayWithIdType:SiteArrayWithIdType = responseSP.data;
		setSiteData(siteArrayWithIdType);
	}

	const getAllPromptSitePub = async (id:string) => {		
		const promptAiResp:any = await axios.get(`${BACKEND_ENDPOINT}/api/promptAi/sitePubblication/${id}`);
		const promptAiArrayWithIdType:PromptAiArrayWithIdType = promptAiResp.data;
		setPromptsAi(promptAiArrayWithIdType);	
	}

	const handleTestPromptAi = async () => {
		try {
			if( selectedPromptId === '' ) {
				alert('Seleziona il promptAI da testare');
				return false;
			}

			setShowTestBtn(false);

			const promptAiResp:any						= await axios.get(`${BACKEND_ENDPOINT}/api/promptAi/generateAi/${articleData._id}/${selectedPromptId}`);
			const response:any 							= await axios.get(`${BACKEND_ENDPOINT}/api/article/${articleData._id}`);
			const articleWithIdType:ArticleWithIdType 	= response.data;			
			if( promptAiResp.data.success === true ) {
				setCalls(promptAiResp.data.data.calls);											
				setArticle(articleWithIdType);				
			}
			setShowTestBtn(true);
		} catch (error) {
			alert('Si è verificato un errore, verifica dalla sezione "Alert"');
			setShowTestBtn(true);
		}
	}

	const handleSendArticleWP = async () => {
		try {
			if( articleData.genarateGpt === 0 ) {
				alert('Articolo non generato completamente');
				return false;
			}

			setShowPublishBtn(false);

			const articleSend:any						= await axios.get(`${BACKEND_ENDPOINT}/api/article/send/${articleData._id}`);
			const response:any 							= await axios.get(`${BACKEND_ENDPOINT}/api/article/${articleData._id}`);			
			if( articleSend.data.success === true ) {				
				let articleWithIdType:ArticleWithIdType 	= response.data;				
				setArticle(articleWithIdType);			
				setShowPublishBtn(true);
				setResponse('Articolo pubblicato con successo');
			} else {
				setResponse('Operazione non eseguita');
				setShowPublishBtn(true);
			}			
		} catch (error) {
			alert('Si è verificato un errore, verifica dalla sezione "Alert"');
			setShowPublishBtn(true);
		}
	}

	const offStepCall = async(call:any,selectedPromptId:string) => {		
		await axios.put(`${BACKEND_ENDPOINT}/api/promptAi/uncomplete/${call.key}/${selectedPromptId}`);
		const promptAiResp:any = await axios.get(`${BACKEND_ENDPOINT}/api/promptAi/${selectedPromptId}`);
		setCalls(promptAiResp.data.calls);
	}

	// Calcola il numero totale di pagine
	const totalPages = Math.ceil(total / pageSize);

	const sendForm = async (schema:string, event:any, id?:string) => {
		let response:boolean;
		if( articleData ) {
			response = await handleUpdate(schema,id,event);
		} else {
			response = await handleCreate(schema,event);
		}

		if( response === true ) {
			setResponse('Operazione effettuata con successo');
		} else {
			setResponse('Operazione non eseguita');
		}
	};

	const sendDelete = async (schema:string, id:string, event:any) => {		
		event.preventDefault();
        event.stopPropagation();
		/* eslint-disable no-restricted-globals */
		if( confirm("Sicuro di voler eliminare il record: "+id ) ) {
			let response:boolean = await handleDelete(schema,id,event);

			if( response === true ) {
				window.location.reload()
			} else {
				setResponse('Operazione non eseguita');
			}
		}
	};

	const getSendWpStatus = (send:number) => {
		if( send === 1 ) {
			return <i className={`${articleStyle.bichecksquarefill} bi bi-check-square-fill`}></i> ;
		} else if( send === 0 ) {
			return <i className={`${articleStyle.bixsquarefill} bi bi-x-square-fill`}></i>
		} else if( send === 3 ) {
			return <i title="Scartato per errore su pubblicazione wp"  className={`${articleStyle.bixexclamation} bi bi-exclamation-triangle-fill`}></i>			
		}
	}

	const getGenerateGptStatus = (generateGpt:number) => {
		if( generateGpt === 1 ) {
			return <i className={`${articleStyle.bichecksquarefill} bi bi-check-square-fill`}></i> ;
		} else if( generateGpt === 0 ) {
			return <i className={`${articleStyle.bixsquarefill} bi bi-x-square-fill`}></i>
		} else if( generateGpt === 3 ) {
			return <i title="Scartato per errore su generazione"  className={`${articleStyle.bixexclamation} bi bi-exclamation-triangle-fill`}></i>			
		}
	}

	const catWP = articleData ? String(articleData.categoryPublishSite) : '0';
	return (		
		<>
			<Modal show={show} onHide={handleClose} className={articleStyle.modalwidth80}>
				<Modal.Header closeButton>
					<Modal.Title className={articleStyle.modalTitle}>
						{articleData ? (` (ID: ${articleData._id})`) : ('')} - {resp}					
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>					
					<Row className={`${articleStyle.row2} ${articleStyle.testPromptAiCalls}`}>
						<span>ELENCO CALLS: </span>
						{promptCalls && Object.entries(promptCalls).map(([key, call]) => (
							<span>{call.key} {call.complete === 1 ? <i onClick={() => offStepCall(call,selectedPromptId)} className={`${articleStyle.bichecksquare} bi bi-check-square`}></i> : ''} </span>
						))}
					</Row>
					<Row className={`${articleStyle.row2} ${articleStyle.testPromptAi}`}>
						<h2>Test Prompt AI</h2>
						<Col>							
							<Form.Group controlId="filterActive">
								<Form.Label>Scegli il prompt</Form.Label>
								<Form.Control name="promptAiId" as="select" onChange={handleSelectionChange}>
									<option value="">Seleziona...</option>
									{promptsAi && Object.entries(promptsAi).map(([key, promptAiWithIdType]) => (
										<option key={promptAiWithIdType._id} value={promptAiWithIdType._id}>{promptAiWithIdType.title}</option>
									))}											
								</Form.Control>
							</Form.Group>
						</Col>
						<Col xs="auto" className={`${articleStyle.buttonsA}`}>
							{showTestBtn && <Button variant="primary" type="button" onClick={handleTestPromptAi}>Run Call</Button>}	
							&nbsp;&nbsp;						
							{!showTestBtn && <Spinner animation="border" variant="primary"/>}
							{showPublishBtn && articleData && articleData.genarateGpt.toString() === '1' && <Button variant="success" type="button" onClick={handleSendArticleWP}>Pubblica</Button>}
							{!showPublishBtn && <Spinner animation="border" variant="primary"/>}
						</Col>
					</Row>
					<div className={articleStyle.dataOverlayArticle}>														
						<Form onSubmit={(event) => { articleData ? sendForm('article',event,articleData._id) : sendForm('article',event)} }>
							<Row className={articleStyle.row2}>
								<Col>
									<Form.Group controlId="filterSite">
										<Form.Label>Site Origine</Form.Label>										
										<Form.Control name="site" as="select" value={articleData && articleData.site ? articleData.site?._id : ''}>
											<option value="">{articleData && articleData.site ? articleData.site._id: ''}Seleziona...</option>
											{siteData && Object.entries(siteData).map(([key, siteWithIdType]) => (
												<option key={siteWithIdType._id} value={siteWithIdType._id}>{siteWithIdType.site}</option>
											))}											
										</Form.Control>
									</Form.Group>
								</Col>							
								<Col>
									<Form.Group controlId="filterSitePublication">
										<Form.Label>Site Destinazione</Form.Label>
										<Form.Control name="sitePublication" as="select" value={articleData ? articleData.sitePublication._id : ''}>
											<option value="">...</option>
											{sitePublicationData && Object.entries(sitePublicationData).map(([key, sitePublicationWithIdType]) => (
												<option key={sitePublicationWithIdType._id} value={sitePublicationWithIdType._id}>{sitePublicationWithIdType.sitePublication}</option>
											))}											
										</Form.Control>
									</Form.Group>
								</Col>	
								<Col>
									<Form.Group controlId="formUrl">
										<Form.Label>Url Origine</Form.Label>
										<Form.Control name="url" type="text" placeholder="Url Origine" defaultValue={articleData ? articleData.url as string : ''} />
									</Form.Group>
								</Col>																								
							</Row>	
							<Row className={articleStyle.row2}>
								<Col>
									<Form.Group controlId="formTitle">
										<Form.Label>Titolo</Form.Label>
										<Form.Control name="title" as="textarea" rows={3} placeholder="Titolo origine" defaultValue={articleData ? articleData.title as string : ''} />
									</Form.Group>
								</Col>										
								<Col>
									<Form.Group controlId="formDescription">
										<Form.Label>Meta Description</Form.Label>
										<Form.Control name="description" as="textarea" rows={3} placeholder="Meta Description" defaultValue={articleData ? articleData.description as string : ''} />
									</Form.Group>
								</Col>	
								<Col>
									<Form.Group controlId="formH1">
										<Form.Label>H1</Form.Label>
										<Form.Control name="h1" as="textarea" rows={3} placeholder="H1" defaultValue={articleData ? articleData.h1 as string : ''} />
									</Form.Group>
								</Col>	
							</Row>

							<Row className={articleStyle.row2}>
								<Col>
									<Form.Group controlId="formBody">
										<Form.Label>Body</Form.Label>
										<Form.Control name="body" as="textarea" rows={3} placeholder="Body" defaultValue={articleData ? articleData.body as string : ''} />
									</Form.Group>								
								</Col>
							</Row>
							<Row className={articleStyle.row2}>								
								<Col>
									<Form.Group controlId="formImg">
										<Form.Label>Img</Form.Label>
										<Form.Control name="img" type="text" placeholder="Img" defaultValue={articleData ? articleData.img as string : ''} />
									</Form.Group>								
								</Col>									
								<Col>
									<Form.Group controlId="formCategoryPublishSite">
										<Form.Label>Categoria WP</Form.Label>
										<Form.Control name="categoryPublishSite" type="text" placeholder="Categoria WP"
											value={categoryWP ? categoryWP : ''} 
											onChange={(event) => handleInputChangeCatWP(event, 'setCatWP')}
										/>
									</Form.Group>													
								</Col>									
							</Row>
							<Row className={articleStyle.row2}>																
								<Col>
									<Form.Group controlId="formBodyAI">
										<Form.Label>Body AI</Form.Label>
										{editor ? (
											<editor.CKEditor
												editor={editor.ClassicEditor}
												data={articleData ? articleData.bodyGpt : ''}
												onChange={(event:any, editor:any) => {
													const data = editor.getData();
													setBodyGpt(data);
												}}
												/>
												) : (
												<p>Editor is loading...</p>
											)}
										<Form.Control name="bodyGpt" type="hidden" value={bodyGpt ? bodyGpt as string : ''} />
									</Form.Group>
								</Col>	
							</Row>
							<Row className={articleStyle.row2}>								
								<Col>
									<Form.Group controlId="formTitleAI">
										<Form.Label>Titolo AI</Form.Label>
										<Form.Control name="titleGpt" as="textarea" rows={3} placeholder="Titolo AI" value={articleData ? articleData.titleGpt as string : ''} />
									</Form.Group>								
								</Col>	
								<Col>
									<Form.Group controlId="formDescriptionAI">
										<Form.Label>Description AI</Form.Label>
										<Form.Control name="descriptionGpt" as="textarea" rows={3} placeholder="Description AI" value={articleData ? articleData.descriptionGpt as string : ''} />
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="formH1AI">
										<Form.Label>H1 AI</Form.Label>
										<Form.Control name="h1Gpt" as="textarea" rows={3} placeholder="H1 AI" value={articleData ? articleData.h1Gpt as string : ''} />
									</Form.Group>
								</Col>		
							</Row>
							<Row className={articleStyle.row2}>								
								<Col>
									<Form.Group controlId="formBulletPoints">
										<Form.Label>Bullet Points</Form.Label>
										<Form.Control name="bulletPoints" as="textarea" placeholder="bulletPoints" value={articleData ? articleData.bulletPoints as string : ''} />										
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="formTecnicalInfo">
										<Form.Label>Scheda tecnica</Form.Label>
										<Form.Control name="tecnicalInfo" as="textarea" placeholder="tecnicalInfo" value={articleData ? articleData.tecnicalInfo as string : ''} />										
									</Form.Group>
								</Col>		
							</Row>
							<Row className={articleStyle.row2}>																
								<Col>
									<Form.Group controlId="formKeywords">
										<Form.Label>Keywords</Form.Label>
										<Form.Control name="keywords" as="textarea" placeholder="keywords" value={articleData ? articleData.keywords as string : ''} />										
									</Form.Group>
								</Col>		
							</Row>
							<Row className={articleStyle.row2}>								
								<Col>
									<Form.Group controlId="formSend">
										<Form.Label>Pubblicato su WP</Form.Label>
										<Form.Control name="send" type="text" placeholder="..." 
											value={sendWP ? sendWP  : ''} 
											onChange={(event) => handleInputChangeCatWP(event, 'setSendWP')}
										/>
									</Form.Group>								
								</Col>	
								<Col>
									<Form.Group controlId="formGenarateAI">
										<Form.Label>Genarate AI</Form.Label>
										<Form.Control name="genarateGpt" type="text" placeholder="..." 
											value={generateGpt ? generateGpt  : ''} 
											onChange={(event) => handleInputChangeCatWP(event, 'setGenerateGpt')}
										/>
									</Form.Group>
								</Col>
								{/* <Col>
									<Form.Group controlId="formPublishDate">
										<Form.Label>Data pubblicazione</Form.Label>
										<Form.Control name="publishDate" type="text" placeholder="..." value={articleData ? articleData.publishDate.toString() : ''} />
									</Form.Group>
								</Col>		 */}
							</Row>
							<Row>
								<Col xs="auto" className="mt-4">
									<Button variant="primary" type="submit">Salva</Button> { resp  && <span className={articleStyle.resp}>{resp}</span> }
								</Col>
							</Row>
						</Form>							
					</div>
				
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>
						Chiudi
					</Button>
				</Modal.Footer>
			</Modal>


			<Container fluid="md" className={`containerStyle rounded mt-4`}>
				<div className="headingWidget">
					<i className="fa fa-plus-square-o" aria-hidden="true"></i>
					<div>
						<h2>Articoli</h2>
					</div>
				</div>
				<div className="widget widget_Article">
					<Form onSubmit={(event) => handleSubmitFormParams(event,router)}>
						<Row className={articleStyle.row2}>
							<Col>
								<Form.Group controlId="filterSite">
									<Form.Label>Site Origine</Form.Label>
									<Form.Control name="site" as="select" value={articleData && articleData.site ? articleData.site.site : ''}>
										<option value="">Seleziona...</option>
										{siteData && Object.entries(siteData).map(([key, siteWithIdType]) => (
											<option key={siteWithIdType._id} value={siteWithIdType._id}>{siteWithIdType.site}</option>
										))}											
									</Form.Control>
								</Form.Group>
							</Col>							
							<Col>
								<Form.Group controlId="filterSitePublication">
									<Form.Label>Site Destinazione</Form.Label>
									<Form.Control name="sitePublication" as="select" value={articleData ? articleData.sitePublication.sitePublication : ''}>
										<option value="">Seleziona...</option>
										{sitePublicationData && Object.entries(sitePublicationData).map(([key, sitePublicationWithIdType]) => (
											<option key={sitePublicationWithIdType._id} value={sitePublicationWithIdType._id}>{sitePublicationWithIdType.sitePublication}</option>
										))}											
									</Form.Control>
								</Form.Group>
							</Col>	
							<Col>
								<Form.Group controlId="formUrl">
									<Form.Label>Url Origine</Form.Label>
									<Form.Control name="url" type="text" placeholder="Url Origine" value={query.url as string || ''} />
								</Form.Group>
							</Col>																								
						</Row>	
						<Row className={articleStyle.row2}>
							<Col>
								<Form.Group controlId="formTitle">
									<Form.Label>Titolo</Form.Label>
									<Form.Control name="title" type="text" placeholder="Titolo origine" value={query.title as string || ''} />
								</Form.Group>
							</Col>	
							<Col>
								<Form.Group controlId="formTitleGpt">
									<Form.Label>Titolo AI</Form.Label>
									<Form.Control name="titleGpt" type="text" placeholder="Titolo AI" value={query.titleGpt as string || ''} />
								</Form.Group>								
							</Col>	
							<Col>
								<Form.Group controlId="formcategoryPublishSite">
									<Form.Label>Categoria WP</Form.Label>
									<Form.Control name="categoryPublishSite" type="text" placeholder="Categoria WP" value={query.categoryPublishSite as string || ''} />
								</Form.Group>
							</Col>	
						</Row>
						<Row className={articleStyle.row2}>
							<Col>
								<Form.Group controlId="formuserPublishSite">
									<Form.Label>Utente WP</Form.Label>
									<Form.Control name="userPublishSite" type="text" placeholder="Utente WP"  value={query.userPublishSite as string || ''} />
								</Form.Group>
							</Col>	
							<Col>
								<Form.Group controlId="formStartDate">
									<Form.Label>Data e Ora Inizio</Form.Label>
									<Form.Control 
									type="datetime-local" 
									name="startDate" 
									value={query.startDate ? new Date(query.startDate as string).toISOString().slice(0,16) : ''} />
								</Form.Group>						
							</Col>									
							<Col>
								<Form.Group controlId="formEndDate">
									<Form.Label>Data e Ora Fine</Form.Label>
									<Form.Control 
									type="datetime-local" 
									name="endDate" 
									value={query.endDate ? new Date(query.endDate as string).toISOString().slice(0,16) : ''} />
								</Form.Group>						
							</Col>									
						</Row>
						<Row className={articleStyle.row2}>
							<Col>
								<Form.Group controlId="formID">
									<Form.Label>ID</Form.Label>
									<Form.Control name="id" type="text" placeholder="ID"  value={query.id as string || ''} />
								</Form.Group>						
							</Col>	
						</Row>
						<Row className={articleStyle.row2}>
							<Button variant="primary" type="submit">Filtra</Button>
						</Row>					
					</Form>
					<table className={`${articleStyle.tableList} table footable mt-4`}>
						<thead>
							<tr>
								<th data-class="expand">ID</th>
								<th data-class="expand">Sito Origine</th>
								<th data-class="expand">Sito Destinazione</th>
								<th data-class="expand">Url origine</th>								
								<th data-class="expand">Titolo</th>																					
								<th data-class="expand">Titolo AI</th>																					
								<th data-class="expand">Open Ai Gen</th>								
								<th data-class="expand">Pubblicato WP</th>								
								<th data-class="expand"></th>								
								<th data-class="expand"></th>								
							</tr>
						</thead>
						<tbody>
							{articles.map((article: ArticleWithIdType) => (
								<tr key={article._id} className="selectable" data-openoverlay="Article" data-id={article._id}>									
									<td className="important" data-modify="input" data-field="screen">{article._id}</td>
									<td className="important" data-modify="input" data-field="screen">{article.site.site}</td>
									<td className="important" data-modify="input" data-field="screen">{article.sitePublication.sitePublication}</td>
									<td className="important" data-modify="input" data-field="screen">{article.url}</td>
									<td className="important" data-modify="input" data-field="screen">{article.title}</td>																		
									<td className="important" data-modify="input" data-field="screen">{article.titleGpt}</td>																		
									<td className="important" data-modify="input" data-field="screen">
										{getGenerateGptStatus(article.genarateGpt)}</td>																		
									<td className="important" data-modify="input" data-field="screen">
										{getSendWpStatus(article.send)}
									</td>																		
									<td className="important" data-modify="input" data-field="screen"><i  onClick={() => handleShow(article._id)} className="bi bi-pencil-fill"></i></td>	
									<td className="important" data-modify="input" data-field="screen"><i onClick={(event) => sendDelete('article',article._id,event)} className="bi bi-trash"></i></td>																										
								</tr>
							))}
						</tbody>
					</table>
					<div>
						<div>
							<Button variant="success" type="button" className="mb-3 float-end" onClick={() => handleShow(null)}>Nuovo</Button>
						</div>
						<Pagination>
							{Array.from({ length: totalPages }, (_, i) => (
								<Pagination.Item key={i} active={i === (i + 1)} onClick={() => handlePagination(i + 1, router)}>{i + 1}</Pagination.Item>
							))}
						</Pagination>
					</div>
				</div>
			</Container>
		</>
	);
}

export default ArticleComponent;