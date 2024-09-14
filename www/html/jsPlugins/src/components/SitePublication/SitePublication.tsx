import React, { useState } 							from 'react';
import axios 										from 'axios';
import { useRouter } 								from 'next/router';
import Container 									from 'react-bootstrap/Container';
import { 
	Modal, 
	Button,
	Pagination, 
	Form, 
	Row, 
	Col 
} 													from 'react-bootstrap';

import { SitePublicationWithIdType } 				from '../../dbService/models/SitePublication';
import { 
	handleCreate, 
	handleDelete, 
	handlePagination, 
	handleSubmitFormParams, 
	handleUpdate 
} 													from '../../services/globalNext';
import { SitePublicationProps } 					from './interface/SitePublicationInterface';
import sitePublicationStyle 						from './sitePublication.module.scss';
import { PromptAiArrayWithIdType } 					from '../../dbService/models/PromptAi';
import { BACKEND_ENDPOINT } 						from '../../constants';
import "react-datepicker/dist/react-datepicker.css";


const SitePublicationComponent: React.FC<SitePublicationProps> = ({ sitePublications, total, page, pageSize }) => {
const router 												= useRouter();
	const { query } 										= router; 
	const [show, setShow] 									= useState<boolean>(false);
	const [resp, setResponse]								= useState<string|null>(null);
	const [sitePublicationData, setSitePublicationData]   	= useState<SitePublicationWithIdType|null>(null);
	const [promptsAi, setPromptsAi]   						= useState<PromptAiArrayWithIdType|null>(null);

	const handleClose	= () => { setShow(false); window.location.reload(); };

	const handleShow 	= async (id?: string|null) => {
		try {
			if( id !== null ) {
				const response:any		= await axios.get(`${BACKEND_ENDPOINT}/api/sitePublication/${id}`);
				const sitePublicationWithIdType:SitePublicationWithIdType = response.data;
				setSitePublicationData(sitePublicationWithIdType);

				const promptAiResp:any	= await axios.get(`${BACKEND_ENDPOINT}/api/promptAi/sitePubblication/${sitePublicationWithIdType.sitePublication}`);
				const promptAiArrayWithIdType:PromptAiArrayWithIdType = promptAiResp.data;
				setPromptsAi(promptAiArrayWithIdType);				
			
			} else {
				setSitePublicationData(null);
			}
			setShow(true);
		} catch (error) {
			console.error('Errore durante il recupero dei dati dell\'sitePublication:', error);			
		}
	}
	
	const totalPages = Math.ceil(total / pageSize);
	const sendForm 	 = async (schema:string, event:any, id?:string) => {
		let response:boolean;
		if( sitePublicationData ) {
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
			<Modal show={show} onHide={handleClose} className={sitePublicationStyle.modalwidth80}>
				<Modal.Header closeButton>
					<Modal.Title className={sitePublicationStyle.modalTitle}>{sitePublicationData ? (`${sitePublicationData.sitePublication} (ID: ${sitePublicationData._id})`) : ('')} - {resp}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					
					<div className={sitePublicationStyle.dataOverlaySitePublication}>														
						<Form onSubmit={(event) => { sitePublicationData ? sendForm('sitePublication',event,sitePublicationData._id) : sendForm('sitePublication',event)} }>
							<Row className={sitePublicationStyle.row2}>
								<Col>
									<Form.Group controlId="formSitePublication">
										<Form.Label>Sito pubblicazione</Form.Label>
										<Form.Control name="sitePublication" type="text" placeholder="Sito pubblicazione" defaultValue={sitePublicationData ? sitePublicationData.sitePublication : ''} />
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="formTokenUrl">
										<Form.Label>Api WP tokenUrl</Form.Label>
										<Form.Control name="tokenUrl" type="text" placeholder="Api WP tokenUrl" defaultValue={sitePublicationData ? sitePublicationData.tokenUrl : ''}  />
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="formUrl">
										<Form.Label>Api WP Post</Form.Label>
										<Form.Control name="url" type="text" placeholder="Api WP Post" defaultValue={sitePublicationData ? sitePublicationData.url : ''} />
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="filterActive">
										<Form.Label>Stato</Form.Label>
										<Form.Control name="active" as="select" defaultValue={sitePublicationData ? sitePublicationData.active : ''}>
											<option value="">Seleziona...</option>
											<option value="1">Attivo</option>
											<option value="0">Disattivo</option> 												
										</Form.Control>
									</Form.Group>
								</Col>							
							</Row>
							<Row className={sitePublicationStyle.row2}>								
								<Col>
									<Form.Group controlId="formSiteType">
										<Form.Label>Tipo</Form.Label>
										<Form.Control name="siteType" type="text" placeholder="Tipo" defaultValue={sitePublicationData ? sitePublicationData.siteType : ''} />
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="formUrlImages">
										<Form.Label>Api WP Image</Form.Label>
										<Form.Control name="urlImages" type="text" placeholder="Api WP Image" defaultValue={sitePublicationData ? sitePublicationData.urlImages : ''} />
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="formSelectorBody">
										<Form.Label>Api WP Categorie</Form.Label>
										<Form.Control name="urlCategories" type="text" placeholder="Api WP Categorie" defaultValue={sitePublicationData ? sitePublicationData.urlCategories : ''} />
									</Form.Group>
								</Col>							
							</Row>
							<Row className={sitePublicationStyle.row2}>
								<Col>
									<Form.Group controlId="formUsername">
										<Form.Label>WP Username</Form.Label>
										<Form.Control name="username" type="text" placeholder="username" defaultValue={sitePublicationData ? sitePublicationData.username : ''} />
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="formPassword">
										<Form.Label>WP Password</Form.Label>
										<Form.Control name="password" type="text" placeholder="password" defaultValue={sitePublicationData ? sitePublicationData.password : ''} />
									</Form.Group>
								</Col>
							</Row>
							<Row className={sitePublicationStyle.row2}>
								<Col>
									<Form.Group controlId="formCronGenerateAi">
										<Form.Label>Cron generazione OpenAI</Form.Label>
										<Form.Control name="cronGenerateAi" type="text" placeholder="cronGenerateAi" defaultValue={sitePublicationData ? sitePublicationData.cronGenerateAi : ''} />
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="formCronSendToWp">
										<Form.Label>Cron Pubblicazione Post</Form.Label>
										<Form.Control name="cronSendToWp" type="text" placeholder="cronSendToWp" defaultValue={sitePublicationData ? sitePublicationData.cronSendToWp : ''} />
									</Form.Group>
								</Col>
								<Col>
									<Form.Group controlId="filterActive">
										<Form.Label>PromptAi</Form.Label>
										<Form.Control name="promptAiId" as="select" defaultValue={sitePublicationData ? sitePublicationData.promptAiId : ''}>
											<option value="">Seleziona...</option>
											{promptsAi && Object.entries(promptsAi).map(([key, promptAiWithIdType]) => (
												<option key={promptAiWithIdType._id} value={promptAiWithIdType._id}>{promptAiWithIdType.title}</option>
											))}											
										</Form.Control>
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
						<h2>Siti Pubblicazione</h2>
					</div>
				</div>
				<div className="widget widget_SitePublication">
					<Form onSubmit={(event) => handleSubmitFormParams(event,router)}>
						<Row className={sitePublicationStyle.row2}>
							<Col>
								<Form.Group controlId="formSitePublication">
									<Form.Label>Nome</Form.Label>
									<Form.Control name="sitePublication" type="text" placeholder="Nome" defaultValue={query.sitePublication as string || ''} />
								</Form.Group>
							</Col>							
							<Col>
								<Form.Group controlId="formUrl">
									<Form.Label>Tipo </Form.Label>
									<Form.Control name="siteType" type="text" placeholder="Tipo di sito" defaultValue={query.siteType as string || ''} />
								</Form.Group>
							</Col>
							<Col>
								<Form.Group controlId="formUrl">
									<Form.Label>API WP Post </Form.Label>
									<Form.Control name="url" type="text" placeholder="End Point api wp posts" defaultValue={query.url as string || ''} />
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
						<Row className={sitePublicationStyle.row2}>							
							<Col>
								<Form.Group controlId="formTokenUrl">
									<Form.Label>API WP Token </Form.Label>
									<Form.Control name="tokenUrl" type="text" placeholder="End point token url wp" defaultValue={query.tokenUrl as string || ''} />
								</Form.Group>
							</Col>
							<Col>
								<Form.Group controlId="formUrlImages">
									<Form.Label>API WP Image </Form.Label>
									<Form.Control name="urlImages" type="text" placeholder="End point immagini wp" defaultValue={query.urlImages as string || ''} />
								</Form.Group>
							</Col>
							<Col>
								<Form.Group controlId="formUrlCategories">
									<Form.Label>API WP Categorie </Form.Label>
									<Form.Control name="urlCategories" type="text" placeholder="End point categorie wp" defaultValue={query.urlCategories as string || ''} />
								</Form.Group>
							</Col>
						</Row>
						<Row className={sitePublicationStyle.row2}>							
							<Col>
								<Form.Group controlId="formUsername">
									<Form.Label>API WP Username </Form.Label>
									<Form.Control name="username" type="text" placeholder="Username wp" defaultValue={query.username as string || ''} />
								</Form.Group>
							</Col>
							<Col>
								<Form.Group controlId="formPassword">
									<Form.Label>API WP Password </Form.Label>
									<Form.Control name="password" type="text" placeholder="Password wp" defaultValue={query.password as string || ''} />
								</Form.Group>
							</Col>							
							<Col>
								<Form.Group controlId="formPromptAiId">
									<Form.Label>PromptAi Id</Form.Label>
									<Form.Control name="promptAiId" type="text" placeholder="PromptAi Id" defaultValue={query.promptAiId as string || ''} />
								</Form.Group>
							</Col>							
						</Row>
						<Row className={sitePublicationStyle.row2}>														
							<Button variant="primary" className='float-end me-2' type="submit">Filtra</Button>							
						</Row>						
					</Form>
					<table className="table footable mt-4">
						<thead>
							<tr>
								<th data-class="expand">Nome</th>								
								<th data-class="expand">Tipo</th>								
								<th data-class="expand">APi WP Token</th>								
								<th data-class="expand">API WP POST</th>								
								<th data-class="expand">API WP Image</th>								
								<th data-class="expand">Api WP Categ.</th>								
								<th data-class="expand">CronGenerateAi</th>								
								<th data-class="expand">CronSendToWp</th>								
								<th data-class="expand">PromptAi ID</th>								
								<th data-class="expand">Stato</th>								
								<th data-class="expand"></th>								
								<th data-class="expand"></th>								
							</tr>
						</thead>
						<tbody>
							{sitePublications.map((sitePublication: SitePublicationWithIdType) => (
								<tr key={sitePublication._id} className="selectable" data-openoverlay="SitePublication" data-id={sitePublication._id}>									
									<td className="important" data-modify="input" data-field="screen">{sitePublication.sitePublication}</td>
									<td className="important" data-modify="input" data-field="screen">{sitePublication.siteType}</td>
									<td className="important" data-modify="input" data-field="screen">{sitePublication.url ? 'SI' : 'Mancante'}</td>
									<td className="important" data-modify="input" data-field="screen">{sitePublication.tokenUrl ? 'SI' : 'Mancante'}</td>
									<td className="important" data-modify="input" data-field="screen">{sitePublication.urlImages ? 'SI' : 'Mancante'}</td>									
									<td className="important" data-modify="input" data-field="screen">{sitePublication.urlCategories ? 'SI' : 'Mancante'}</td>									
									<td className="important" data-modify="input" data-field="screen">{sitePublication.cronGenerateAi}</td>									
									<td className="important" data-modify="input" data-field="screen">{sitePublication.cronSendToWp}</td>									
									<td className="important" data-modify="input" data-field="screen">{sitePublication.promptAiId}</td>									
									<td className="important" data-modify="input" data-field="screen">{sitePublication.active == 1 ? 'Attivo' : 'Disattivo'}</td>									
									<td className="important" data-modify="input" data-field="screen"><i  onClick={() => handleShow(sitePublication._id)} className="bi bi-pencil-fill"></i></td>	
									<td className="important" data-modify="input" data-field="screen"><i onClick={(event) => sendDelete('sitePublication',sitePublication._id,event)} className="bi bi-trash"></i></td>																										
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

export default SitePublicationComponent;