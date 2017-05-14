import audio from 'src/singletons/audio';
import {client_id, SC_Track} from 'src/singletons/sc';

export interface Track extends SC_Track {
    index:number;
    isPlaying:boolean;
}

export type ChangeListener = {(tracks:Track[]):void};

const listeners:ChangeListener[] = [];

let currentIndex = null;
let tracks:Track[] = [];

const loadTrack = (track:Track) => {
    if (!track.stream_url) return;
    document.title = `${track.title} — Spectrogram`;
    audio.crossOrigin = 'anonymous';
    audio.src = `${track.stream_url}?client_id=${client_id}`;
};

export const pauseTrack = (index:number) => {
    const track = tracks[index];
    if (!track) return;
    track.isPlaying = false;
    audio.pause();
    triggerChange();
};

export const playTrack = (index:number) => {
    const track = tracks[index];
    if (!track) return;
    if (index !== currentIndex) {
        pauseTrack(currentIndex);
        currentIndex = index;
        loadTrack(track);
    }
    track.isPlaying = true;
    audio.play();
    triggerChange();
};

export const nextTrack = () => {
    let newIndex = currentIndex + 1;
    newIndex %= tracks.length;
    playTrack(newIndex);
};

export const prevTrack = () => {
    let newIndex = currentIndex - 1;
    if (newIndex < 0) newIndex = tracks.length - 1;
    playTrack(newIndex);
};

export const setTracks = (scTracks:SC_Track[], silent?:boolean) => {
    pauseTrack(currentIndex);
    currentIndex = null;
    tracks = scTracks.map((scTrack, index) => ({
        ...scTrack, index, isPlaying: false,
    }));
    if (!silent) triggerChange();
};

export const getTracks = ():Track[] => {
    return tracks;
};

export const onChange = (listener:ChangeListener) => {
    listeners.push(listener);
};

const triggerChange = () => {
    listeners.forEach(listener => listener(tracks));
};

audio.addEventListener('ended', nextTrack);
