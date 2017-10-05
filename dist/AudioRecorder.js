var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as React from 'react';
import FontAwesome from 'react-fontawesome';
import { Button } from 'react-bootstrap';
import WAVEInterface from './waveInterface';
import downloadBlob from './downloadBlob';
;
;
var AudioRecorder = /** @class */ (function (_super) {
    __extends(AudioRecorder, _super);
    function AudioRecorder() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.waveInterface = new WAVEInterface();
        _this.state = {
            isRecording: false,
            isPlaying: false,
            audioData: _this.props.initialAudio
        };
        _this.onAudioEnded = function () {
            _this.setState({ isPlaying: false });
            if (_this.props.onEnded)
                _this.props.onEnded();
        };
        _this.onRemoveClick = function () {
            _this.waveInterface.reset();
            if (_this.state.audioData && _this.props.onChange)
                _this.props.onChange({ duration: 0, audioData: null });
            _this.setState({
                isPlaying: false,
                isRecording: false,
                audioData: null,
            });
        };
        _this.onUploadClick = function () {
            if (_this.props.onUploadClickHandler) {
                if (_this.props.onUploadClickHandler(_this.waveInterface.audioData)) {
                    _this.onRemoveClick();
                }
            }
        };
        _this.onDownloadClick = function () {
            if (_this.props.onDownloadClick) {
                _this.props.onDownloadClick();
            }
            downloadBlob(_this.state.audioData, _this.props.filename);
        };
        _this.onButtonClick = function (event) {
            if (_this.state.audioData) {
                if (_this.state.isPlaying) {
                    _this.stopPlayback();
                    event.preventDefault();
                }
                else {
                    _this.startPlayback();
                }
            }
            else {
                if (_this.state.isRecording) {
                    _this.stopRecording();
                }
                else {
                    _this.startRecording();
                }
            }
        };
        return _this;
    }
    AudioRecorder.prototype.componentWillReceiveProps = function (nextProps) {
        // handle new initialAudio being passed in
        if (nextProps.initialAudio &&
            nextProps.initialAudio !== this.props.initialAudio &&
            this.state.audioData &&
            nextProps.initialAudio !== this.state.audioData) {
            this.waveInterface.reset();
            this.setState({
                audioData: nextProps.initialAudio,
                isPlaying: false,
                isRecording: false,
            });
        }
    };
    AudioRecorder.prototype.componentWillMount = function () { this.waveInterface.reset(); };
    AudioRecorder.prototype.componentWillUnmount = function () { this.waveInterface.reset(); };
    AudioRecorder.prototype.startRecording = function () {
        var _this = this;
        if (!this.state.isRecording) {
            this.waveInterface.startRecording()
                .then(function () {
                _this.setState({ isRecording: true });
                if (_this.props.onRecordStart)
                    _this.props.onRecordStart();
            })
                .catch(function (err) { throw err; });
        }
    };
    AudioRecorder.prototype.stopRecording = function () {
        this.waveInterface.stopRecording();
        this.setState({
            isRecording: false,
            audioData: this.waveInterface.audioData
        });
        if (this.props.onChange) {
            this.props.onChange({
                duration: this.waveInterface.audioDuration,
                audioData: this.waveInterface.audioData
            });
        }
    };
    AudioRecorder.prototype.startPlayback = function () {
        var _this = this;
        if (!this.state.isPlaying) {
            this.waveInterface.startPlayback(this.props.loop, this.onAudioEnded).then(function () {
                _this.setState({ isPlaying: true });
                if (_this.props.onPlay)
                    _this.props.onPlay();
            });
        }
    };
    AudioRecorder.prototype.stopPlayback = function () {
        this.waveInterface.stopPlayback();
        this.setState({ isPlaying: false });
        if (this.props.onAbort)
            this.props.onAbort();
    };
    AudioRecorder.prototype.render = function () {
        return (React.createElement("div", { className: "AudioRecorder" },
            React.createElement(Button, { className: [
                    'AudioRecorder-button',
                    this.state.audioData ? 'hasAudio' : '',
                    this.state.isPlaying ? 'isPlaying' : '',
                    this.state.isRecording ? 'isRecording' : '',
                ].join(' '), onClick: this.onButtonClick },
                this.state.audioData && !this.state.isPlaying && this.props.playLabel,
                this.state.audioData && this.state.isPlaying && this.props.playingLabel,
                !this.state.audioData && !this.state.isRecording && this.props.recordLabel,
                !this.state.audioData && this.state.isRecording && this.props.recordingLabel),
            this.state.audioData &&
                React.createElement(Button, { className: "AudioRecorder-remove", onClick: this.onRemoveClick }, this.props.removeLabel),
            this.state.audioData && this.props.downloadable &&
                React.createElement(Button, { className: "AudioRecorder-download", onClick: this.onDownloadClick }, this.props.downloadLabel),
            this.state.audioData && this.props.uploadable &&
                React.createElement(Button, { className: "AudioRecorder-upload", onClick: this.onUploadClick }, this.props.uploadLabel)));
    };
    AudioRecorder.defaultProps = {
        loop: false,
        downloadable: true,
        uploadable: true,
        className: '',
        style: {},
        filename: 'output.wav',
        playLabel: (React.createElement("span", null,
            React.createElement(FontAwesome, { name: 'play' }),
            " Play")),
        playingLabel: React.createElement("span", null,
            React.createElement(FontAwesome, { name: 'pause' }),
            " Playing"),
        recordLabel: (React.createElement("span", null,
            React.createElement(FontAwesome, { name: 'microphone' }),
            " Record")),
        recordingLabel: React.createElement("span", null,
            React.createElement(FontAwesome, { name: 'microphone', style: { color: "red" } }),
            " Recording"),
        removeLabel: React.createElement("span", null,
            React.createElement(FontAwesome, { name: 'times' }),
            " Remove"),
        downloadLabel: React.createElement("span", null,
            React.createElement(FontAwesome, { name: 'download' }),
            " Save"),
        uploadLabel: React.createElement("span", null,
            React.createElement(FontAwesome, { name: 'upload' }),
            " Upload") // unicode floppy disk
    };
    return AudioRecorder;
}(React.Component));
export default AudioRecorder;
