import React from 'react';
import { CreatePlaylistModal } from './CreatePlaylistModal';
import { EditPlaylistModal } from './EditPlaylistModal';
import { DeletePlaylistModal } from './DeletePlaylistModal';
import { AddSongModal } from './AddSongModal';

export const PlaylistModals = () => {
  return (
    <>
      <CreatePlaylistModal />
      <EditPlaylistModal />
      <DeletePlaylistModal />
      <AddSongModal />
    </>
  );
};
