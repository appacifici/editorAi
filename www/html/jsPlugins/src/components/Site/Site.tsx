import React, { useEffect, useState } 				from 'react';
import axios 										from 'axios';
import { useRouter } 								from 'next/router';
import Container 									from 'react-bootstrap/Container';
import { Modal, Button, 
	Pagination, Form, Row, Col, Spinner } 			from 'react-bootstrap';

import { SiteWithIdType } 							from '../../dbService/models/Site';
import { handleCreate, handleDelete, 
	handlePagination, handleSubmitFormParams,
	handleUpdate } 									from '../../services/globalNext';
import { SiteProps } 								from './interface/SiteInterface';
import { SitePublicationArrayWithIdType } 			from '../../dbService/models/SitePublication';
import siteStyle 									from './site.module.scss';
import { BACKEND_ENDPOINT } 						from '../../constants';
import "react-datepicker/dist/react-datepicker.css";


const SiteComponent: React.FC<SiteProps> = ({ sites, total, page, pageSize }) => {
	const router 											= useRouter();
	const { query } 										= router; 
	const [show, setShow] 									= useState<boolean>(false);
	const [resp, setResponse]								= useState<string|null>(null);
	const [siteData, setSiteData]   						= useState<SiteWithIdType|null>(null);
	const [sitePublicationData, setSitePublicationData]   	= useState<SitePublicationArrayWithIdType|null>(null);
	const [showImportBtn, setShowImportBtn] 				= useState<string>('0');

	const handleClose 				= () => { setShow(false); window.location.reload(); };
	const handleShow 				= async (id?: string|null) => {
		try {
			if( id !== null ) {
				const response:any 					= await axios.get(`${BACKEND_ENDPOINT}/api/site/${id}`);
				//const siteWithIdType:SiteWithIdType = response.data;
				setSiteData(response.data);
			} else {
				setSiteData(null);
			}
			getAllSitePubblication();
			setShow(true);
		} catch (error) {
			console.error('Errore durante il recupero dei dati dell\'site:', error);			
		}
	}

	const handleImportArticle = async (id:string,event:React.MouseEvent<HTMLElement>) => {
		event.preventDefault();
        event.stopPropagation();
		try {			
			setShowImportBtn(id);
			const promptAiResp:any						= await axios.get(`${BACKEND_ENDPOINT}/api/site/import/${id}`);			
			setShowImportBtn('0');
		} catch (error) {
			alert('Si è verificato un errore, verifica dalla sezione "Alert"');
			setShowImportBtn('0');
		}
	}

	useEffect(() => {
		getAllSitePubblication();
	}, []); 
	
	const getAllSitePubblication = async () => {
		const responseSP:any = await axios.get(`${BACKEND_ENDPOINT}/api/sitePublication`);
		const sitePublicationArrayWithIdType:SitePublicationArrayWithIdType = responseSP.data;
		setSitePublicationData(sitePublicationArrayWithIdType);
	}

	// Calcola il numero totale di pagine
	const totalPages = Math.ceil(total / pageSize);

	const sendForm = async (schema:string, event:any, id?:string) => {
		let response:boolean;
		if( siteData ) {
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

	return (
		<>
			<Modal show={show} onHide={handleClose} className={siteStyle.modalwidth80}>
				<Modal.Header closeButton>
					<Modal.Title className={siteStyle.modalTitle}>{siteData ? (`${siteData.site} (ID: ${siteData._id})`) : ('')} - {resp}</Modal.Title>
				</Modal.Header>
				<Modal.Body>					
					<div className={siteStyle.dataOverlaySite}>														
						<Form onSubmit={(event) => { siteData ? sendForm('site',event,siteData._id) : sendForm('site',event)} }>
							<Row className={siteStyle.row2}>
								<Col>
									<Form.Group controlId="formSite">
										<Form.Label>Nome</Form.Label>
										<Form.Control name="site" type="text" placeholder="nome" defaultValue={siteData ? siteData.site : ''} />
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="filterActive">
										<Form.Label>Site Destinazione</Form.Label>
										<Form.Control name="sitePublication" as="select" defaultValue={siteData ? siteData.sitePublication : ''}>
											<option value="">Seleziona...</option>
											{sitePublicationData && Object.entries(sitePublicationData).map(([key, sitePublicationWithIdType]) => (
												<option key={sitePublicationWithIdType._id} value={sitePublicationWithIdType.sitePublication}>{sitePublicationWithIdType.sitePublication}</option>
											))}											
										</Form.Control>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="formUrl">
										<Form.Label>Sitemap url</Form.Label>
										<Form.Control name="url" type="text" placeholder="Url" defaultValue={siteData ? siteData.url : ''} />
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="filterActive">
										<Form.Label>Stato</Form.Label>
										<Form.Control name="active" as="select" defaultValue={siteData ? siteData.active : ''}>
											<option value="">Seleziona...</option>
											<option value="1">Attivo</option>
											<option value="0">Disattivo</option> 												
										</Form.Control>
									</Form.Group>
								</Col>							
							</Row>
							<Row className={siteStyle.row2}>
								<Col>
									<Form.Group controlId="formUrl">
										<Form.Label>Formato lettura</Form.Label>
										<Form.Control name="format" as="select" defaultValue={siteData ? siteData.format : ''}>
											<option value="">Seleziona...</option>
											<option value="sitemap">Sitemap</option>
											<option value="sitemapGZ">Sitemap GZ</option> 												
											<option value="sitemapList">Sitemap List</option> 												
										</Form.Control>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="formSelectorBody">
										<Form.Label>Selettore body</Form.Label>
										<Form.Control name="selectorBody" type="text" placeholder="selectorBody" defaultValue={siteData ? siteData.selectorBody : ''} />
									</Form.Group>
								</Col>
							</Row>
							<Row className={siteStyle.row2}>
								<Col>
									<Form.Group controlId="formSelectorImg">
										<Form.Label>Selettore Img</Form.Label>
										<Form.Control name="selectorImg" type="text" placeholder="selectorImg" defaultValue={siteData ? siteData.selectorImg : ''} />
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="formCronImportSitemap">
										<Form.Label>Cron ImportSitemap</Form.Label>
										<Form.Control name="cronImportSitemap" type="text" placeholder="cronImportSitemap" defaultValue={siteData ? siteData.cronImportSitemap : ''} />
									</Form.Group>
								</Col>
							</Row>
							<Row className={siteStyle.row2}>
								<Col>
									<Form.Group controlId="formCategoryPublishSite">
										<Form.Label>CategoryPublishSite</Form.Label>
										<Form.Control name="categoryPublishSite" type="text" placeholder="categoryPublishSite" defaultValue={siteData ? siteData.categoryPublishSite : ''} />
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="formUserPublishSite">
										<Form.Label>userPublishSite</Form.Label>
										<Form.Control name="userPublishSite" type="text" placeholder="userPublishSite" defaultValue={siteData ? siteData.userPublishSite : ''} />
									</Form.Group>
								</Col>
							</Row>
							<Row>
								<Col xs="auto" className="mt-4">
									<Button variant="primary" type="submit">Salva</Button>
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
						<h2>Siti Origine</h2>
					</div>
				</div>
				<div className="widget widget_Site">
					<Form onSubmit={(event) => handleSubmitFormParams(event,router)}>
						<Row className={siteStyle.row2}>
							<Col>
								<Form.Group controlId="formSite">
									<Form.Label>Nome</Form.Label>
									<Form.Control name="site" type="text" placeholder="Nome" defaultValue={query.site as string || ''} />
								</Form.Group>
							</Col>
							<Col>
								<Form.Group controlId="filterSitePublication">
									<Form.Label>Site Destinazione</Form.Label>
									<Form.Control name="sitePublication" as="select">
										<option value="">Seleziona...</option>
										{sitePublicationData && Object.entries(sitePublicationData).map(([key, sitePublicationWithIdType]) => (
											<option key={sitePublicationWithIdType._id} value={sitePublicationWithIdType.sitePublication}>{sitePublicationWithIdType.sitePublication}</option>
										))}											
									</Form.Control>
								</Form.Group>
							</Col>
							<Col>
								<Form.Group controlId="formUrl">
									<Form.Label>Url</Form.Label>
									<Form.Control name="url" type="text" placeholder="Url" defaultValue={query.url as string || ''} />
								</Form.Group>
							</Col>
							<Col>
								<Form.Group controlId="filterActive">
									<Form.Label>Stato</Form.Label>
									<Form.Control name="active"  as="select" defaultValue={query.active as string || ''}>
										<option value="">Seleziona...</option>
										<option value="1">Attivo</option>
										<option value="0">Disattivo</option> 												
									</Form.Control>
								</Form.Group>
							</Col>																								
						</Row>	
						<Row className={siteStyle.row2}>
							<Button variant="primary" type="submit">Filtra</Button>
						</Row>					
					</Form>
					<table className="table footable mt-4">
						<thead>
							<tr>
								<th data-class="expand">Nome</th>
								<th data-class="expand">Site dest</th>
								<th data-class="expand">Sitemap url</th>								
								<th data-class="expand">Formato</th>								
								<th data-class="expand">CronImportSitemap</th>								
								<th data-class="expand">Stato</th>								
								<th data-class="expand">Importa</th>								
								<th data-class="expand"></th>								
								<th data-class="expand"></th>								
							</tr>
						</thead>
						<tbody>
							{sites.map((site: SiteWithIdType) => (
								<tr key={site._id} className="selectable" data-openoverlay="Site" data-id={site._id}>									
									<td className="important" data-modify="input" data-field="screen">{site.site}</td>
									<td className="important" data-modify="input" data-field="screen">{site.sitePublication}</td>
									<td className="important" data-modify="input" data-field="screen">{site.url}</td>
									<td className="important" data-modify="input" data-field="screen">{site.format}</td>
									<td className="important" data-modify="input" data-field="screen">{site.cronImportSitemap}</td>									
									<td className="important" data-modify="input" data-field="screen">{site.active == 1 ? 'Attivo' : 'Disattivo'}</td>									
									<td className="important" data-modify="input" data-field="screen">
										{showImportBtn !== site._id && <i onClick={(event) => handleImportArticle(site._id,event)} className="bi-file-earmark-arrow-down"></i>}
										{showImportBtn == site._id && <Spinner animation="border" variant="primary"/>}
									</td>	
									<td className="important" data-modify="input" data-field="screen"><i onClick={() => handleShow(site._id)} className="bi bi-pencil-fill"></i></td>	
									<td className="important" data-modify="input" data-field="screen"><i onClick={(event) => sendDelete('site',site._id,event)} className="bi bi-trash"></i></td>																										
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

export default SiteComponent;