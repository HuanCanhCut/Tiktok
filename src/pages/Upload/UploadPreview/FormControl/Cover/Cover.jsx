import classNames from 'classnames/bind'
import style from './Cover.module.scss'
import { useRef, useContext, forwardRef, useImperativeHandle } from 'react'
import Tippy from '@tippyjs/react'
import useDarkMode from '~/hooks/useDarkMode'
import { motion } from 'framer-motion'

import { fileUploadContext } from '~/pages/Upload/Upload'
import { CircleInfo } from '~/Components/Icons'

const cx = classNames.bind(style)

function Cover({ captureImages, slideQuantity }, ref) {
    const { file } = useContext(fileUploadContext)

    const sliderRef = useRef(null)
    const thumbRef = useRef(null)
    const videoRef = useRef(null)

    useImperativeHandle(ref, () => ({
        thumbnailTime: () => {
            if (videoRef.current && videoRef.current.duration) {
                return videoRef.current.currentTime
            }
        },
    }))

    const startDrag = (e) => {
        e.preventDefault()

        if (!sliderRef.current && !thumbRef.current) {
            return
        }

        const sliderRect = sliderRef.current.getBoundingClientRect()

        const dragMove = (e) => {
            // handle drag thumb
            const position = (e.clientX - thumbRef.current.offsetWidth / 2 - sliderRect.left) / sliderRect.width
            const horizontalRatio = 1 - thumbRef.current.offsetWidth / sliderRef.current.offsetWidth
            const clampedPosition = Math.min(horizontalRatio, Math.max(0, position))

            thumbRef.current.style.left = `${clampedPosition * 100}%`

            // Handles the current time of the video
            const duration = videoRef.current.duration
            const progress =
                (Number(thumbRef.current.style.left.toString().replace('%', '')) / 100 / horizontalRatio) * 100
            const sweek = (duration / 100) * progress
            videoRef.current.currentTime = sweek
        }

        const dragEnd = () => {
            window.removeEventListener('mousemove', dragMove)
            window.removeEventListener('mouseup', dragEnd)
        }

        window.addEventListener('mousemove', dragMove)
        window.addEventListener('mouseup', dragEnd)
    }

    return (
        <div>
            <div className={cx('cover')}>
                <span className={cx('title')}>Cover</span>
                <Tippy
                    content={`Select a cover or upload one from your device. An engaging cover can effectively capture viewers’ interest.`}
                    placement="bottom-start"
                    interactive
                >
                    <div className={cx('circle-icon')}>
                        <CircleInfo />
                    </div>
                </Tippy>
            </div>

            <div
                className={cx('cover-frame', {
                    darkMode: useDarkMode(),
                })}
                ref={sliderRef}
            >
                {captureImages.map((item, index) => {
                    return (
                        <motion.img
                            src={item}
                            initial={{ opacity: 0, y: 20, filter: 'blur(2px)' }}
                            animate={{ opacity: 1, y: 0, blur: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.7, delay: index * 0.18 }}
                            alt=""
                            key={index}
                            className={cx('capture-image')}
                            style={{ maxWidth: `${100 / slideQuantity}%` }}
                        />
                    )
                })}
                <div className={cx('cover-thumb')} onMouseDown={startDrag} ref={thumbRef}>
                    <video src={file.preview} className={cx('video')} ref={videoRef}></video>
                </div>
            </div>
        </div>
    )
}

export default forwardRef(Cover)
