import React, { useEffect, useState } 				from 'react';
import axios 										from 'axios';
import { useRouter } 								from 'next/router';
import AceEditor 									from 'react-ace';

import Container 									from 'react-bootstrap/Container';
import { Modal, Button, 
	Pagination, Form, Row, Col } 					from 'react-bootstrap';

import { PromptAiWithIdType } 						from '../../dbService/models/PromptAi';
import { handleCreate, handleDelete, 
	handlePagination, handleSubmitFormParams,
	handleUpdate } 									from '../../services/globalNext';
import { PromptAiProps } 							from './interface/PromptAiInterface';
import promptAiStyle 								from './promptAi.module.scss';
import { SitePublicationArrayWithIdType } 			from '../../dbService/models/SitePublication';
import { BACKEND_ENDPOINT } 						from '../../constants';
import "react-datepicker/dist/react-datepicker.css";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

const PromptAiComponent: React.FC<PromptAiProps> = ({ promptsAi, total, page, pageSize }) => {
	const router 											= useRouter();
	const { query } 										= router; 
	const [show, setShow] 									= useState<boolean>(false);
	const [resp, setResponse]								= useState<string|null>(null);
	const [jsonCalls, setJsonCalls] 						= useState<object>({});
	const [jsonSteps, setJsonSteps] 						= useState<object>({});
	const [promptAiData, setPromptAiData]   				= useState<PromptAiWithIdType|null>(null);
	const [sitePublicationData, setSitePublicationData]   	= useState<SitePublicationArrayWithIdType|null>(null);

	const handleClose 				= () => { setShow(false); window.location.reload(); };
	const handleShow 				= async (id?: string|null) => {
		try {
			if( id !== null ) {
				const response:any = await axios.get(`${BACKEND_ENDPOINT}/api/promptAi/${id}`);
				const promptAiWithIdType:PromptAiWithIdType = response.data;
				setPromptAiData(promptAiWithIdType);
				setJsonCalls(promptAiWithIdType.calls);
				setJsonSteps(promptAiWithIdType.steps);
				getAllSitePubblication();
			} else {
				const response:any = await axios.get(`${BACKEND_ENDPOINT}/api/promptAi/default`);
				const promptAiWithIdType:PromptAiWithIdType = response.data;
				
				setJsonCalls(promptAiWithIdType.calls);
				setJsonSteps(promptAiWithIdType.steps);
				getAllSitePubblication();
			}			
			setShow(true);
		} catch (error) {
			console.error('Errore durante il recupero dei dati dell\'promptAi:', error);			
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


	const handleJsonCallsChange = (calls:string) => {
		try {
        	setJsonCalls(JSON.parse(calls));
		} catch (error) {
			console.error('Errore durante il recupero dei dati dell\'promptAi:', error);			
		}
    };
	const handleJsonStepsChange = (steps:string) => {
		try {
			setJsonSteps(JSON.parse(steps));
		} catch (error) {
			console.error('Errore durante il recupero dei dati dell\'promptAi:', error);			
		}
    };

	// Calcola il numero totale di pagine
	const totalPages = Math.ceil(total / pageSize);

	const sendForm = async (schema:string, event:any, id?:string) => {
		let response:boolean;
		if( promptAiData ) {
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
			<Modal show={show} onHide={handleClose} className={promptAiStyle.modalwidth80}>
				<Modal.Header closeButton>
					<Modal.Title className={promptAiStyle.modalTitle}>{promptAiData ? (`${promptAiData.sitePublication} (ID: ${promptAiData._id})`) : ('')} - {resp}</Modal.Title>
				</Modal.Header>
				<Modal.Body>					
					<div className={promptAiStyle.dataOverlayPromptAi}>														
						<Form onSubmit={(event) => { promptAiData ? sendForm('promptAi',event,promptAiData._id) : sendForm('promptAi',event)} }>
							<Row className={promptAiStyle.row2}>
								<Col>
									<Form.Group controlId="formTitle">
										<Form.Label>Titolo</Form.Label>
										<Form.Control name="title" type="text" placeholder="titolo" defaultValue={promptAiData ? promptAiData.title : ''} />
									</Form.Group>
								</Col>								
								<Col>
									<Form.Group controlId="filterActive">
										<Form.Label>Site Destinazione</Form.Label>
										<Form.Control name="sitePublication" as="select" defaultValue={promptAiData ? promptAiData.sitePublication : ''}>
											<option value="">Seleziona...</option>
											{sitePublicationData && Object.entries(sitePublicationData).map(([key, sitePublicationWithIdType]) => (
												<option key={sitePublicationWithIdType._id} value={sitePublicationWithIdType.sitePublication}>{sitePublicationWithIdType.sitePublication}</option>
											))}											
										</Form.Control>
									</Form.Group>
								</Col>	
								<Col>
									<Form.Group controlId="formDefaultPrompt">
										<Form.Label>Default Prompt</Form.Label>
										<Form.Control name="defaultPrompt" as="select" placeholder="titolo" defaultValue={promptAiData ? promptAiData.defaultPrompt : ''} >
											<option key={0} value={0}>NO</option>
											<option key={1} value={1}>SI</option>
										</Form.Control>
									</Form.Group>
								</Col>							
							</Row>							
							<Row className={promptAiStyle.row2}>
								<Col>
									<Form.Group controlId="formCalls">
										<Form.Label>Calls</Form.Label>
										<Form.Control name="calls" type="hidden" defaultValue={JSON.stringify(jsonCalls)} />
										<AceEditor
												mode="json"
												theme="github"
												onChange={handleJsonCallsChange}
												name="UNIQUE_ID_OF_DIV_1"
												editorProps={{ $blockScrolling: false }}
												defaultValue={jsonCalls ? JSON.stringify(jsonCalls, null, 2) : ''}
												setOptions={{
													enableBasicAutocompletion: true,
													enableLiveAutocompletion: true,
													enableSnippets: true,
													showLineNumbers: true,
													tabSize: 4,
													wrap: true,
													useWorker: true // Utilizza un worker per la validazione del JSON
												}}
												height="300px"
												width="100%"
											/>
									</Form.Group>
								</Col>
							</Row>							
							<Row className={promptAiStyle.row2}>
								<Col>
									<Form.Group controlId="formSteps">
										<Form.Label>steps</Form.Label>
										<Form.Control name="steps" type="hidden" defaultValue={JSON.stringify(jsonSteps)} />
										<AceEditor
												mode="json"
												theme="github"
												onChange={handleJsonStepsChange}
												name="UNIQUE_ID_OF_DIV_2"
												editorProps={{ $blockScrolling: false }}
												defaultValue={jsonSteps ? JSON.stringify(jsonSteps, null, 2) : ''}
												setOptions={{
													enableBasicAutocompletion: true,
													enableLiveAutocompletion: true,
													enableSnippets: true,
													showLineNumbers: true,
													tabSize: 4,
													wrap: true,
													useWorker: true // Utilizza un worker per la validazione del JSON
												}}
												height="300px"
												width="100%"
											/>
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
						<h2>Prompt AI</h2>
					</div>
				</div>
				<div className="widget widget_PromptAi">
					<Form onSubmit={(event) => handleSubmitFormParams(event,router)}>
						<Row className={promptAiStyle.row2}>
							<Col>
								<Form.Group controlId="formPromptAi">
									<Form.Label>ID</Form.Label>
									<Form.Control name="id" type="text" placeholder="Id" defaultValue={query.id as string || ''} />
								</Form.Group>
							</Col>
							<Col>
								<Form.Group controlId="filterActive">
									<Form.Label>Site Destinazione</Form.Label>
									<Form.Control name="sitePublication" as="select">
										<option value="">Seleziona...</option>
										{sitePublicationData && Object.entries(sitePublicationData).map(([key, sitePublicationWithIdType]) => (
											<option key={sitePublicationWithIdType._id} value={sitePublicationWithIdType.sitePublication}>{sitePublicationWithIdType.sitePublication}</option>
										))}											
									</Form.Control>
								</Form.Group>
							</Col>																																				
						</Row>	
						<Row className={promptAiStyle.row2}>
							<Button variant="primary" type="submit">Filtra</Button>
						</Row>					
					</Form>
					<table className="table footable mt-4">
						<thead>
							<tr>
								<th data-class="expand">id</th>								
								<th data-class="expand">title</th>								
								<th data-class="expand">sitePublication</th>								
								<th data-class="expand">calls</th>								
								<th data-class="expand">steps</th>																						
								<th data-class="expand">default</th>																						
								<th data-class="expand"></th>								
								<th data-class="expand"></th>								
							</tr>
						</thead>
						<tbody>
							{promptsAi.map((promptAi: PromptAiWithIdType) => (
								<tr key={promptAi._id} className="selectable" data-openoverlay="PromptAi" data-id={promptAi._id}>									
									<td className="important" data-modify="input" data-field="screen">{promptAi._id}</td>									
									<td className="important" data-modify="input" data-field="screen">{promptAi.title}</td>									
									<td className="important" data-modify="input" data-field="screen">{promptAi.sitePublication}</td>									
									<td className="important" data-modify="input" data-field="screen">{promptAi.calls ? JSON.stringify(promptAi.calls).substring(0,50) :'no'}</td>
									<td className="important" data-modify="input" data-field="screen">{promptAi.steps ? JSON.stringify(promptAi.steps).substring(0,50) :'no'}</td>															
									<td className="important" data-modify="input" data-field="screen">{promptAi.defaultPrompt ? 'si' :'no'}</td>															
									<td className="important" data-modify="input" data-field="screen"><i onClick={() => handleShow(promptAi._id)} className="bi bi-pencil-fill"></i></td>	
									<td className="important" data-modify="input" data-field="screen"><i onClick={(event) => sendDelete('promptAi',promptAi._id,event)} className="bi bi-trash"></i></td>																										
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

export default PromptAiComponent;