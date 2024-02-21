import classNames from 'classnames/bind'
import style from './FormControl.module.scss'
import { useContext } from 'react'
import { useState, useReducer, useCallback, useRef } from 'react'
import * as action from './Actions'
import useDarkMode from '~/hooks/useDarkMode'
import ReactModal from 'react-modal'
import { sendEvent } from '~/helpers/event'

import Select from '~/Components/Select'
import { CheckboxTick } from '~/Components/Icons'
import UploadFeat from '~/pages/Upload/UploadPreview/FormControl/UploadFeat'
import Caption from './Caption'
import Cover from './Cover'
import { fileUploadContext } from '../../Upload'
import Button from '~/Components/Button'
import Modal from '~/Components/Modal'
import { currentUserData } from '~/App'
import { uploadVideo } from '~/services/videoService'
import { Wrapper as PopperWrapper } from '~/Components/Popper'

const cx = classNames.bind(style)

const options = [
    {
        title: 'Schedule video',
        type: 'schedule',
        message:
            'By scheduling your video, you allow your video to be uploaded and stored on our servers before posting.',
    },
    {
        title: 'Disclose post content',
        type: 'disclose',
        message: 'Let others know this post promotes a brand, product or service.',
    },
    {
        title: 'Run a copyright check',
        type: 'check',
        message: `We'll check your video for potential copyright infringements on used sounds. If infringements are found, you can edit the video before posting. <strong style="cursor: pointer">Learn more</strong>`,
    },
]

const personCanWatchOptions = ['Public', 'Friends', 'Private']

let modal = {
    title: 'Discard this post?',
    description: 'The video and all edits will be discarded.',
    allowTitle: 'Discard',
    cancelTitle: 'Continue Editing',
}

let allowUserTo = [
    {
        title: 'Comment',
        type: 'comment',
        isChecked: true,
    },
    {
        title: 'Duet',
        type: 'duet',
        isChecked: true,
    },
    {
        title: 'Stitch',
        type: 'stitch',
        isChecked: true,
    },
]

const reducer = (state, action) => {
    switch (action.type) {
        case 'allowSelect':
            const newState = [...state]
            for (let i = 0; i < newState.length; ++i) {
                if (action.payload.type === newState[i].type) {
                    newState[i] = { ...newState[i], isChecked: !action.payload.isChecked }
                    break
                }
            }
            return newState
        default:
            break
    }
}

function FormControl({ captureImages, slideQuantity }) {
    const darkMode = useDarkMode
    const videoRef = useRef()
    const progressRef = useRef()
    const progressValueRef = useRef()

    const { file } = useContext(fileUploadContext)
    const currentUser = useContext(currentUserData)
    const accessToken = currentUser && currentUser.meta.token

    const [isOpen, setIsOpen] = useState(false)
    const [isOpenUploading, setIsOpenUploading] = useState(false)
    const [personCanWatch, setPersonCanWatch] = useState(personCanWatchOptions[0])
    const [allowUser, dispatch] = useReducer(reducer, allowUserTo)

    const handleSelected = useCallback((item) => {
        setPersonCanWatch(item)
    }, [])

    const handleSelectedAllowUser = (item) => {
        dispatch(action.allowAction(item))
    }

    const openModal = useCallback(() => {
        modal = {
            title: 'Discard this post?',
            description: 'The video and all edits will be discarded.',
            allowTitle: 'Discard',
            cancelTitle: 'Continue Editing',
        }
        setIsOpen(true)
    }, [])

    const closeModal = useCallback(() => {
        setIsOpen(false)
    }, [])

    const handleDiscard = useCallback(() => {
        if (file) {
            sendEvent('upload:cancel-upload-file')
        }
        closeModal()
    }, [closeModal, file])

    const handlePostVideo = async () => {
        const formData = new FormData()
        const allows = []
        try {
            allowUser.forEach((item) => {
                if (item.isChecked) {
                    allows.push(item.type)
                }
            })

            const thumbnailTime = Math.round(videoRef.current.thumbnailTime())
            const backgroundMusic =
                currentUser.data.first_name || currentUser.data.last_name
                    ? `Nhạc nền - ${currentUser.data.first_name} ${currentUser.data.last_name}`
                    : 'Âm thanh gốc'

            formData.append('upload_file', file)
            formData.append('description', file.description ? file.description : file.name)
            formData.append('viewable', personCanWatch.toLowerCase())
            formData.append('thumbnail_time', thumbnailTime)
            formData.append('music', backgroundMusic)

            allows.forEach((allow) => {
                formData.append('allows[]', allow)
            })

            setIsOpenUploading(true)

            const handleUploadProgress = (progress) => {
                const progressPercent = progress.progress * 100

                const dashArrayValue = Number(
                    getComputedStyle(progressRef.current)
                        .getPropertyValue('stroke-dasharray')
                        .split(',')[0]
                        .replace('px', '')
                )

                const progressValue = (dashArrayValue * (100 - progressPercent)) / 100

                progressRef.current.style.strokeDashoffset = progressValue
                progressValueRef.current.innerText = `${progressPercent.toFixed(0)}%`
            }

            await uploadVideo({ formData, accessToken, onUploadProgress: handleUploadProgress })
        } catch (error) {
            console.log(error)
        } finally {
            setIsOpenUploading(false)
            modal = {
                title: 'Your videos are being uploaded to Tiktok',
                description: '',
                allowTitle: 'Upload another video',
                cancelTitle: 'Cancel',
            }
            setIsOpen(true)
        }
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <Caption></Caption>
            </div>
            {file && captureImages.length === slideQuantity && (
                <Cover captureImages={captureImages} slideQuantity={slideQuantity} ref={videoRef} />
            )}

            <div className={cx('allow-wrapper')}>
                <div className={cx('person-can-watch')}>
                    <p style={{ display: 'inline-block', fontWeight: 600 }}>Who can watch this video</p>
                    <Select options={personCanWatchOptions} handleSetValue={handleSelected} value={personCanWatch} />
                </div>
                <div className={cx('allow-user-to')}>
                    <p style={{ display: 'inline-block', fontWeight: 600 }}>Allow user to:</p>
                    <div className={cx('allow-menu')}>
                        {allowUser.map((item, index) => {
                            return (
                                <div className={cx('allow-item')} key={index}>
                                    <div
                                        className={cx('checkbox', {
                                            notChecked: !item.isChecked,
                                        })}
                                        onClick={() => {
                                            handleSelectedAllowUser(item)
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            style={{ opacity: 0, position: 'absolute', zIndex: 3, cursor: 'pointer' }}
                                        />

                                        {item.isChecked && (
                                            <CheckboxTick width="12" height="12" className={cx('checkbox-icon')} />
                                        )}
                                    </div>
                                    <span>{item.title}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {options.map((item, index) => {
                return (
                    <UploadFeat
                        title={item.title}
                        key={index}
                        toolTip={item.type === 'schedule'}
                        message={item.message}
                    />
                )
            })}
            <>
                <div className={cx('upload-btn-wrapper')}>
                    <Button roundedOutline large onClick={openModal}>
                        Discard
                    </Button>
                    {captureImages.length === 8 ? (
                        <Button primary large onClick={handlePostVideo}>
                            Post
                        </Button>
                    ) : (
                        <Button disable large>
                            Post
                        </Button>
                    )}
                </div>

                {isOpen && (
                    <Modal
                        isOpen={isOpen}
                        closeModal={closeModal}
                        title={modal.title}
                        description={modal.description}
                        allowTitle={modal.allowTitle}
                        cancelTitle={modal.cancelTitle}
                        vertical={true}
                        onAllow={handleDiscard}
                    />
                )}

                {isOpenUploading && (
                    <ReactModal
                        isOpen={isOpenUploading}
                        overlayClassName={'overlay'}
                        ariaHideApp={false}
                        className={'modal'}
                    >
                        <PopperWrapper
                            className={cx('popper-wrapper', {
                                darkMode: darkMode,
                            })}
                        >
                            <div className={cx('loading-wrapper')}>
                                <svg viewBox="0 0 100 100" size="64" className={cx('loading')}>
                                    <circle className={cx('circle')} cx={50} cy={50} r={46.875}></circle>
                                    <circle
                                        ref={progressRef}
                                        className={cx('circle-progress')}
                                        cx={50}
                                        cy={50}
                                        r={46.875}
                                    ></circle>
                                </svg>
                                <div ref={progressValueRef} className={cx('loading-value')}>
                                    0%
                                </div>
                            </div>
                            <p className={cx('uploading')}>Uploading...</p>
                            <p className={cx('description')}>
                                Leaving the page dose not interrupt the posting progress
                            </p>
                        </PopperWrapper>
                    </ReactModal>
                )}
            </>
        </div>
    )
}

export default FormControl
