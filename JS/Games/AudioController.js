class AudioTrack {
    AudioElement;
    Volume;
    Source;
    Pointer;

    constructor(pointer, src, defaultVol) {
        this.Pointer = pointer;
        this.AudioElement = new Audio(src);
        this.Source = src;
        this.Volume = defaultVol || 0.25;
        this.AudioElement.volume = this.Volume;
    }
}

class AudioController {
    Playlist;
    _ActiveAudioTrack;
    _CurrentVolumeLevel = 0.5;
    IsMuted = false;

    constructor(songOrPlaylist) {
        this.IsMuted = localStorage.getItem('isMuted');
        this.Playlist = [];

        if (typeof songOrPlaylist === Array) {
            songOrPlaylist.forEach((song) => {
                this.Playlist[song.Pointer] = song;
            });
            this.Load(songOrPlaylist[0].pointer);
        }
        else {
            this.Playlist[songOrPlaylist.Pointer] = songOrPlaylist;
            this.Load(songOrPlaylist.Pointer);
        }
    }

    Stop() {
        if (this._ActiveAudioTrack && !this._ActiveAudioTrack.AudioElement.paused) {
            this._ActiveAudioTrack.AudioElement.load();
        }
    }

    Load(pointer) {
        this._ActiveAudioTrack = this.Playlist[pointer];
        this._ActiveAudioTrack.AudioElement.load();
    }

    _UpdateCurrentVolume() {
        if (this._ActiveAudioTrack && !this._ActiveAudioTrack.AudioElement.paused) {
            this._ActiveAudioTrack.AudioElement.volume = this._CurrentVolumeLevel * this._ActiveAudioTrack.Volume;
        }
    }

    Play(pointer) {
        this.Stop();

        if (pointer) {
            this.Load(pointer);
        }

        this._UpdateCurrentVolume();
        
        this._ActiveAudioTrack.AudioElement.muted = this.IsMuted;
        this._ActiveAudioTrack.AudioElement.play();
    }

    AddTrack(audioTrack, pointer) {
        pointer = pointer || audioTrack.Pointer; 
        this.Playlist[pointer] = audioTrack;
    }

    SetVolume(newValue) {
        this._CurrentVolumeLevel = newValue;
        _UpdateCurrentVolume();
    }

    Mute(isMuted) {
        this.IsMuted = isMuted || !this.IsMuted;
        this._ActiveAudioTrack.AudioElement.muted = this.IsMuted;
        localStorage.setItem('isMuted', this.IsMuted);
    }
}