import classNames from 'classnames/bind'
import PropTypes from 'prop-types'
import { createContext, useCallback } from 'react'

import Header from '~/layouts/components/Header'
import SideBar from '../components/SlideBar'
import style from './DefaultLayout.module.scss'
import Login from '../components/Auth/Authen'
import { useState } from 'react'

const cx = classNames.bind(style)

export const GlobalContext = createContext()

function DefaultLayout({ children }) {
    const [close, setClose] = useState(false)

    const handleClose = useCallback(() => {
        setClose(false)
    }, [])

    const handleDisplay = useCallback(() => {
        setClose(true)
    }, [])

    return (
        <GlobalContext.Provider value={handleDisplay}>
            <div className={cx('wrapper')}>
                {close && <div className={cx('overlay')}></div>}
                <Header onLogin={handleDisplay} />
                <div className={cx('container')}>
                    <SideBar />
                    <div className={cx('content-wrapper')}>
                        <div className={cx('content')}>{children}</div>
                    </div>
                </div>
                {close && <Login onClose={handleClose} />}
            </div>
        </GlobalContext.Provider>
    )
}

DefaultLayout.propTypes = {
    children: PropTypes.node.isRequired,
}

export default DefaultLayout
