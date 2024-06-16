import React 				from 'react';
import Link         		from 'next/link';
import styles 				from './aside.module.scss'; 
import { Col, Nav, Row } 	from 'react-bootstrap';
import { emitCommand } from '../../services/socket';
 
function AsideList() {
	return (
		<>
			<aside className='containerStyle rounded mt-4 '>
				<Nav className="pt-1 ps-3 pe-0">
					<Row className={"w-100 "+styles.row}>
						<Col className="mb-2 pb-lg-0 pb-1 border-lg-0 col-12">																					
							<span className={"float-start ms-2 border-lg-0 bg-transparent"}>		
								<Link href={`/`}>									
									Alert
								</Link>						
							</span>
						</Col>			
					</Row>
					<Row className={"w-100 "+styles.row}>
						<Col className="mb-2 pb-lg-0 pb-1 border-lg-0 col-12">																					
							<span className={"float-start ms-2 border-lg-0 bg-transparent"}>		
								<Link href={`/sites`}>									
									Siti origine
								</Link>						
							</span>
						</Col>			
						<Col className="mb-2 pb-lg-0 pb-1 border-lg-0 col-12">																					
							<span className={"float-start ms-2 border-lg-0 bg-transparent"}>		
								<Link href={`/sitespublication`}>									
									Siti pubblicazione
								</Link>						
							</span>
						</Col>			
						<Col className="mb-2 pb-lg-0 pb-1 border-lg-0 col-12">																					
							<span className={"float-start ms-2 border-lg-0 bg-transparent"}>		
								<Link href={`/promptAi`}>									
									Prompt AI
								</Link>						
							</span>
						</Col>			
						<Col className="mb-2 pb-lg-0 pb-1 border-lg-0 col-12">																					
							<span className={"float-start ms-2 border-lg-0 bg-transparent"}>		
								<Link href={`/article`}>									
									Articoli
								</Link>						
							</span>
						</Col>			
						<Col className="mb-2 pb-lg-0 pb-1 border-lg-0 col-12">																														
							<span className={`float-start ms-2 border-lg-0 bg-transparent ${styles.redReset}`} onClick={() => emitCommand('resetCron')}>Riavvia Cron</span>										
						</Col>			
					</Row>
				</Nav>		
			</aside>
		</>
	);
}

export default AsideList;