import React, { useState } 							from 'react';
import axios 										from 'axios';
import { useRouter } 								from 'next/router';
import Container 									from 'react-bootstrap/Container';
import { Modal, Button, Table, Badge, Accordion, 
	Pagination, Form, Row, Col } 					from 'react-bootstrap';

import { AlertWithIdType } 							from '../../dbService/models/Alert';
import { handlePagination, handleSubmitFormParams } from '../../services/globalNext';
import { AlertProps } 								from './interface/AlertInterface';
import alertStyle 									from './alert.module.scss';
import { BACKEND_ENDPOINT } 						from '../../constants';
import "react-datepicker/dist/react-datepicker.css";



const AlertComponent: React.FC<AlertProps> = ({ alerts, total, page, pageSize }) => {
	const router 					= useRouter();
	const { query } 				= router; 
	const [show, setShow] 			= useState(false);
	const [alertData, setAlertData] = useState<any>(null); // Tipo specifico per i dati dell'alert	
	const handleClose 				= () => setShow(false);

	const handleShow 				= async (id: string) => {
		try {
			const response = await axios.get(`${BACKEND_ENDPOINT}/api/alerts/${id}`);  // Sostituisci con il tuo endpoint corretto
			setAlertData(response.data);
			setShow(true);
		} catch (error) {
			console.error('Errore durante il recupero dei dati dell\'alert:', error);			
		}
	}

	// Calcola il numero totale di pagine
	const totalPages = Math.ceil(total / pageSize);

	const renderTextBlocks = (text: string) => {
		const separator = '[#---------------------------------------#]';
		const blocks = text.split(separator).filter(block => block.trim() !== '');
		console.log(blocks);
		return (
			<Accordion defaultActiveKey="0">
				{blocks.map((block, index) => (
					<Accordion.Item eventKey={String(index)} key={index}>
						<Accordion.Header>Step #{index + 1}</Accordion.Header>
						<Accordion.Body>
							<pre><div dangerouslySetInnerHTML={{ __html: block.trim() }} /></pre>
						</Accordion.Body>
					</Accordion.Item>
				))}
			</Accordion>
		);
	};

	return (
		<>
			<Modal show={show} onHide={handleClose} className={alertStyle.modalwidth80}>
				<Modal.Header closeButton>
					<Modal.Title>{alertData?.processName}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{alertData ? (
						<div className={alertStyle.dataOverlayAlert}>
							<div className={alertStyle.infos}>
								<span><span className={alertStyle.orange}>Origine:</span>&nbsp;&nbsp;{alertData.originSite}</span>
								<span><span className={alertStyle.orange}>Destinazione:</span>&nbsp;&nbsp;{alertData.destinationSite}</span>
								<span><span className={alertStyle.orange}>Process ID:</span>&nbsp;&nbsp;{alertData.process}</span>
								<span><span className={alertStyle.orange}>Name:</span>&nbsp;&nbsp;{alertData.processName}</span>
								<span><span className={alertStyle.orange}>Data:</span>&nbsp;&nbsp;{new Date(alertData.createdAt).toLocaleString()}</span>
							</div>							
							<Table striped bordered hover>
								<tbody>
									<tr>
										<td>
											<div className="head">
												<Badge bg="success">Chiamata</Badge>
											</div>
											<div className="overflow">
												{alertData.callData && renderTextBlocks(alertData.callData)}
											</div>
										</td>
										<td>
											<div className="head">
												<Badge bg="success">Risposta</Badge>
											</div>
											<div className="overflow">
												{alertData.callResponse && renderTextBlocks(alertData.callResponse)}
											</div>
										</td>
									</tr>
									<tr>
										<td>
											<div className="head">
												<Badge bg="danger">Error</Badge>
											</div>
											<div className="overflow">
												{alertData.error && renderTextBlocks(alertData.error)}
											</div>
										</td>
										<td>
											<div className="head">
												<Badge bg="info">Alert</Badge>
											</div>
											<div className="overflow">
												{alertData.alert && renderTextBlocks(alertData.alert)}
											</div>
										</td>
									</tr>
									<tr>
										<td colSpan={2}>
											<div className="head">
												<Badge bg="success">Debug</Badge>
											</div>
											<div className="overflow">
												{alertData.debug && <div dangerouslySetInnerHTML={{ __html: alertData.debug }} />}
											</div>
										</td>
									</tr>
								</tbody>
							</Table>
						</div>
					) : (
						<p>Caricamento...</p>
					)}
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
						<h2>Alert monitoraggio</h2>
					</div>
				</div>
				<div className="widget widget_Alert">
					<Form onSubmit={(event) => handleSubmitFormParams(event,router)}>
						<Row className={alertStyle.row2}>
							<Col>
								<Form.Group controlId="formOriginSite">
									<Form.Label>Sito origine</Form.Label>
									<Form.Control name="originSite" type="text" placeholder="Sito Origine" defaultValue={query.originSite as string || ''} />
								</Form.Group>
							</Col>
							<Col>
								<Form.Group controlId="formDestinationSite">
									<Form.Label>Sito destinazione</Form.Label>
									<Form.Control name="destinationSite" type="text" placeholder="Sito Destinazione" defaultValue={query.destinationSite as string || ''}  />
								</Form.Group>
							</Col>
							<Col>
								<Form.Group controlId="formProcessName">
									<Form.Label>Nome processo</Form.Label>
									<Form.Control name="processName" type="text" placeholder="Nome Processo" defaultValue={query.processName as string || ''} />
								</Form.Group>
							</Col>
							<Col>
								<Form.Group controlId="formProcessId">
								<Form.Label>ID processo</Form.Label>
									<Form.Control name="process" type="text" placeholder="ID Processo" defaultValue={query.process as string || ''} />
								</Form.Group>
							</Col>							
						</Row>
						<Row className={alertStyle.row2}>
							<Col>
								<Form.Group controlId="formStartDate">
									<Form.Label>Data e Ora Inizio</Form.Label>
									<Form.Control 
									type="datetime-local" 
									name="startDate" 
									defaultValue={query.startDate ? new Date(query.startDate as string).toISOString().slice(0,16) : ''} />
								</Form.Group>
							</Col>
							<Col>
								<Form.Group controlId="formEndDate">
									<Form.Label>Data e Ora Fine</Form.Label>
									<Form.Control 
									type="datetime-local" 
									name="endDate" 
									defaultValue={query.endDate ? new Date(query.endDate as string).toISOString().slice(0,16) : ''} />
								</Form.Group>
							</Col>
							<Col xs="auto" className="mt-4">
								<Form.Group controlId="filterError">
									<Form.Check type="checkbox" label="Error" name="filterError" defaultChecked={query.filterError === 'on'} />
								</Form.Group>
							</Col>
							<Col xs="auto" className="mt-4">
								<Form.Group controlId="filterAlert">
									<Form.Check type="checkbox" label="Alert" name="filterAlert" defaultChecked={query.filterAlert === 'on'}  />
								</Form.Group>
							</Col>
							<Col xs="auto" className="mt-4">
								<Form.Group controlId="filterCallResponse">
									<Form.Check type="checkbox" label="Risposta" name="filterCallResponse" defaultChecked={query.filterCallResponse === 'on'}  />
								</Form.Group>
							</Col>							
						</Row>
						<Row className={alertStyle.row2}>							
								<Button variant="primary" type="submit">Filtra</Button>
						</Row>
					</Form>
					<table className="table footable mt-4">
						<thead>
							<tr>
								<th data-class="expand">Date</th>
								<th data-class="expand">Name</th>
								<th data-class="expand">Id Articolo</th>
								<th data-class="expand">Sito Orig.</th>
								<th data-class="expand">Sito Desc.</th>
								<th data-class="expand">Chiamata</th>
								<th data-class="expand">Risposta</th>
								<th data-class="expand">Error</th>
								<th data-class="expand">Alert</th>
								{/* Commentati in quanto marcatori Twig non necessari in React
                                <th data-class="expand">Debug</th>
                                <th data-class="expand">General</th> */}
								<th data-class="expand">Process</th>
								<th data-class="expand"></th>
							</tr>
						</thead>
						<tbody>
							{alerts.map((alert: AlertWithIdType) => (
								<tr key={alert._id} className="selectable" data-openoverlay="Alert" data-id={alert._id}>
									<td className="important center"><b>{alert.createdAt.toLocaleString()}</b></td>
									<td className="important" data-modify="input" data-field="screen">{alert.articleId}</td>
									<td className="important" data-modify="input" data-field="screen">{alert.processName}</td>
									<td className="important" data-modify="input" data-field="screen">{alert.originSite}</td>
									<td className="important" data-modify="input" data-field="screen">{alert.destinationSite}</td>
									<td className="important" data-modify="input" data-field="screen">
										{alert.callData ? <i className={`bi bi-circle-fill ${alertStyle.grey}`}></i> : null}
									</td>
									<td className="important" data-modify="input" data-field="screen">
										{alert.callResponse ? <i className={`bi bi-circle-fill ${alertStyle.green}`}></i> : null}
									</td>
									<td className="important">
										{alert.error ? <i className={`bi bi-circle-fill ${alertStyle.red}`}></i> : null}
									</td>
									<td className="important" data-modify="input" data-field="screen">
										{alert.alert ? <i className={`bi bi-circle-fill ${alertStyle.yellow}`}></i> : null}
									</td>
									<td className="important">{alert.process}</td>
									<td className="important"><i   onClick={() => handleShow(alert._id)} className={`${alertStyle.bicard} bi bi-card-list`}></i></td>
								</tr>
							))}
						</tbody>
					</table>
					<div>
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

export default AlertComponent;