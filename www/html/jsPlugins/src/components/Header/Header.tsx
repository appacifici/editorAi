import React            from 'react';
import headerStyle      from './header.module.scss';

function Header() {
    return( 
        <>
            <header>
                <div className={headerStyle.topBar}>
                    AI - DASHBOARD
                </div>                
            </header>
        </>
    );
}
export default Header;