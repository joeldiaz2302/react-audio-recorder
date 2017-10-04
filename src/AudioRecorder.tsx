import * as React from 'react';
import FontAwesome from 'react-fontawesome';
import { Row, Button } from 'react-bootstrap';
import WAVEInterface from './waveInterface';
import downloadBlob from './downloadBlob';

interface AudioRecorderChangeEvent {
  duration: number,
  audioData?: Blob,
}
interface AudioRecorderProps {
  initialAudio?: Blob,
  downloadable?: boolean,
  uploadable?: boolean,
  loop?: boolean,
  filename?: string,
  className?: string,
  style?: Object,

  onAbort?: () => void,
  onChange?: (AudioRecorderChangeEvent) => void,
  onEnded?: () => void,
  onPause?: () => void,
  onPlay?: () => void,
  onRecordStart?: () => void,
  onDownloadClick?: () => void,
  onUploadClickHandler?: (object)=>void,

  playLabel?: string,
  playingLabel?: string,
  recordLabel?: string,
  recordingLabel?: string,
  removeLabel?: string,
  downloadLabel?: string,
  uploadLabel?: string,
  uploadConfig?: Object,
};

interface AudioRecorderState {
  isRecording: boolean,
  isPlaying: boolean,
  audioData?: Blob
};

export default class AudioRecorder extends React.Component<AudioRecorderProps, AudioRecorderState> {
  waveInterface = new WAVEInterface();

  state: AudioRecorderState = {
    isRecording: false,
    isPlaying: false,
    audioData: this.props.initialAudio
  };

  static defaultProps = {
    loop: false,
    downloadable: true,
    uploadable: true,
    className: '',
    style: {},
    filename: 'output.wav',
    playLabel: (<span><FontAwesome name='play' /> Play</span>),
    playingLabel: <span><FontAwesome name='pause' /> Playing</span>,
    recordLabel: (<span><FontAwesome name='microphone' /> Record</span>),
    recordingLabel: <span><FontAwesome name='microphone' style={{color: "red"}}/> Recording</span>,
    removeLabel: <span><FontAwesome name='times' /> Remove</span>,
    downloadLabel: <span><FontAwesome name='download' /> Save</span>, // unicode floppy disk,
    uploadLabel: <span><FontAwesome name='upload' /> Upload</span> // unicode floppy disk
  };

  componentWillReceiveProps(nextProps) {
    // handle new initialAudio being passed in
    if (
      nextProps.initialAudio &&
      nextProps.initialAudio !== this.props.initialAudio &&
      this.state.audioData &&
      nextProps.initialAudio !== this.state.audioData
    ) {
      this.waveInterface.reset();
      this.setState({
        audioData: nextProps.initialAudio,
        isPlaying: false,
        isRecording: false,
      });
    }
  }

  componentWillMount() { this.waveInterface.reset(); }
  componentWillUnmount() { this.waveInterface.reset(); }

  startRecording() {
    if (!this.state.isRecording) {
      this.waveInterface.startRecording()
        .then(() => {
          this.setState({ isRecording: true });
          if (this.props.onRecordStart) this.props.onRecordStart();
        })
        .catch((err) => { throw err; });
    }
  }

  stopRecording() {
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
  }

  startPlayback() {
    if (!this.state.isPlaying) {
      this.waveInterface.startPlayback(this.props.loop, this.onAudioEnded).then(() => {
        this.setState({ isPlaying: true });
        if (this.props.onPlay) this.props.onPlay();
      });
    }
  }

  stopPlayback() {
    this.waveInterface.stopPlayback();
    this.setState({ isPlaying: false });
    if (this.props.onAbort) this.props.onAbort();
  }

  onAudioEnded = () => {
    this.setState({ isPlaying: false });
    if (this.props.onEnded) this.props.onEnded();
  };

  onRemoveClick = () => {
    this.waveInterface.reset();
    if (this.state.audioData && this.props.onChange) this.props.onChange({ duration: 0, audioData: null });
    this.setState({
      isPlaying: false,
      isRecording: false,
      audioData: null,
    });
  };

  onUploadClick = () => {
    if (this.props.onUploadClickHandler){
      if (this.props.onUploadClickHandler(this.waveInterface.audioData)){
        this.onRemoveClick();
      }
    }
  };

  onDownloadClick = () => {
    if (this.props.onDownloadClick){
      this.props.onDownloadClick();
    }
    downloadBlob(this.state.audioData, this.props.filename);
  };

  onButtonClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    if (this.state.audioData) {
      if (this.state.isPlaying) {
        this.stopPlayback();
        event.preventDefault();
      } else {
        this.startPlayback();
      }
    } else {
      if (this.state.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    }
  };

  render() {
    return (
      <div className="AudioRecorder">
        <Button
          className={
            [
              'AudioRecorder-button',
              this.state.audioData ? 'hasAudio' : '',
              this.state.isPlaying ? 'isPlaying' : '',
              this.state.isRecording ? 'isRecording' : '',
            ].join(' ')
          }
          onClick={this.onButtonClick}
        >
          {this.state.audioData && !this.state.isPlaying && this.props.playLabel}
          {this.state.audioData && this.state.isPlaying && this.props.playingLabel}
          {!this.state.audioData && !this.state.isRecording && this.props.recordLabel}
          {!this.state.audioData && this.state.isRecording && this.props.recordingLabel}
        </Button>
        {this.state.audioData &&
          <Button
            className="AudioRecorder-remove"
            onClick={this.onRemoveClick}
          >
            {this.props.removeLabel}
          </Button>
        }
        {this.state.audioData && this.props.downloadable &&
          <Button
            className="AudioRecorder-download"
            onClick={this.onDownloadClick}
          >
            {this.props.downloadLabel}
          </Button>
        }
        {this.state.audioData && this.props.uploadable &&
          <Button
            className="AudioRecorder-upload"
            onClick={this.onUploadClick}
          >
            {this.props.uploadLabel}
          </Button>
        }
      </div>
    );
  }
}
