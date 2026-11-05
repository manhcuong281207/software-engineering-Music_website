import React, { useState, useEffect } from "react";
import {
  X,
  Users2,
  Search,
  UserPlus2,
  Trash2,
  Loader2,
  Mic2,
  Sliders,
  Check,
} from "lucide-react";
import {
  getPublicArtistsApi,
  addSongArtistApi,
  removeSongArtistApi,
} from "../../api/catalog";
import { Button } from "../ui/Button";
import { ArtistAvatar } from "../ui/ArtistAvatar";
import { toast } from "sonner";

export const FeatArtistsModal = ({ isOpen, onClose, song, onUpdate }) => {
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [role, setRole] = useState("FEATURED"); // FEATURED | PRODUCER
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  // Search debounced
  useEffect(() => {
    if (!keyword.trim() || !isOpen) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await getPublicArtistsApi({
          keyword: keyword.trim(),
          page: 0,
          size: 8,
        });
        const list = res?.data?.content || [];
        // Lọc bỏ những artist đã có trong bài hát
        const existingIds = song?.artists?.map((a) => a.artistId) || [];
        setSearchResults(list.filter((a) => !existingIds.includes(a.id)));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, song?.artists, isOpen]);

  if (!isOpen || !song) return null;

  const currentArtists = song.artists || [];

  const handleAddArtist = async () => {
    if (!selectedArtist) {
      toast.error("Vui lòng chọn một nghệ sĩ để thêm");
      return;
    }

    setIsAdding(true);
    try {
      await addSongArtistApi(song.id, {
        artistId: selectedArtist.id,
        role,
      });
      toast.success(`Đã thêm nghệ sĩ ${selectedArtist.stageName} vào bài hát`);
      setSelectedArtist(null);
      setKeyword("");
      setSearchResults([]);
      onUpdate?.();
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể thêm nghệ sĩ phụ";
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveArtist = async (artistId, artistName) => {
    setRemovingId(artistId);
    try {
      await removeSongArtistApi(song.id, artistId);
      toast.success(`Đã gỡ nghệ sĩ ${artistName} khỏi bài hát`);
      onUpdate?.();
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể gỡ nghệ sĩ";
      toast.error(msg);
    } finally {
      setRemovingId(null);
    }
  };

  const getRoleLabel = (roleCode) => {
    switch (roleCode) {
      case "MAIN":
        return { label: "Nghệ sĩ chính", color: "bg-red-500/10 text-[#fa2d48] border-red-500/20" };
      case "FEATURED":
        return { label: "Feat (Góp giọng)", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
      case "PRODUCER":
        return { label: "Nhà sản xuất", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      default:
        return { label: roleCode, color: "bg-neutral-800 text-neutral-300 border-neutral-700" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-[#18181c] border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Nghệ sĩ hợp tác</h2>
              <p className="text-xs text-neutral-400 truncate max-w-sm">{song.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Danh sách nghệ sĩ hiện tại */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
              Danh sách nghệ sĩ trong bài hát ({currentArtists.length})
            </h3>
            <div className="space-y-2">
              {currentArtists.map((a) => {
                const roleInfo = getRoleLabel(a.role);
                const isMain = a.role === "MAIN";

                return (
                  <div
                    key={a.artistId}
                    className="flex items-center justify-between rounded-xl border border-neutral-800 bg-[#121215] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <ArtistAvatar
                        src={a.avatarUrl}
                        alt={a.artistName}
                        size="sm"
                        className="h-10 w-10"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{a.artistName}</p>
                        <span
                          className={`inline-block mt-0.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${roleInfo.color}`}
                        >
                          {roleInfo.label}
                        </span>
                      </div>
                    </div>

                    {!isMain && (
                      <button
                        onClick={() => handleRemoveArtist(a.artistId, a.artistName)}
                        disabled={removingId === a.artistId}
                        className="rounded-lg p-2 text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Gỡ khỏi bài hát"
                      >
                        {removingId === a.artistId ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form thêm nghệ sĩ hợp tác mới */}
          <div className="rounded-xl border border-neutral-800 bg-[#121215]/80 p-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <UserPlus2 className="h-4 w-4 text-[#fa2d48]" />
              Thêm nghệ sĩ Feat / Producer
            </h3>

            {/* Tìm kiếm nghệ sĩ */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  const val = e.target.value;
                  setKeyword(val);
                  if (!val.trim()) setSearchResults([]);
                  setSelectedArtist(null);
                }}
                placeholder="Tìm kiếm nghệ sĩ theo tên nghệ danh..."
                className="w-full rounded-xl border border-neutral-700 bg-[#18181c] pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-[#fa2d48] focus:outline-none"
              />
              {isSearching && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-neutral-400" />
              )}
            </div>

            {/* Kết quả tìm kiếm */}
            {searchResults.length > 0 && !selectedArtist && (
              <div className="max-h-40 overflow-y-auto rounded-xl border border-neutral-700/80 bg-[#18181c] divide-y divide-neutral-800">
                {searchResults.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => {
                      setSelectedArtist(art);
                      setSearchResults([]);
                    }}
                    className="flex items-center gap-3 p-2.5 hover:bg-neutral-800/80 cursor-pointer transition-colors"
                  >
                    <ArtistAvatar src={art.avatarUrl} alt={art.stageName} size="xs" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">{art.stageName}</p>
                      {art.bio && (
                        <p className="text-[10px] text-neutral-400 truncate">{art.bio}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nghệ sĩ đã chọn */}
            {selectedArtist && (
              <div className="flex items-center justify-between rounded-xl border border-[#fa2d48]/40 bg-[#fa2d48]/5 p-3">
                <div className="flex items-center gap-3">
                  <ArtistAvatar
                    src={selectedArtist.avatarUrl}
                    alt={selectedArtist.stageName}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {selectedArtist.stageName}
                    </p>
                    <span className="text-[11px] text-neutral-400">Đã chọn</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedArtist(null)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Chọn vai trò */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-neutral-400">Vai trò:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("FEATURED")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    role === "FEATURED"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <Mic2 className="h-3 w-3" />
                  Feat (Góp giọng)
                </button>
                <button
                  type="button"
                  onClick={() => setRole("PRODUCER")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    role === "PRODUCER"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <Sliders className="h-3 w-3" />
                  Producer (Sản xuất)
                </button>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddArtist}
              disabled={!selectedArtist || isAdding}
              className="w-full"
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Xác nhận thêm vào bài hát
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-neutral-800/80 px-6 py-4 bg-[#141418]">
          <Button variant="dark" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

