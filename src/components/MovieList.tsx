import {
  Star,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  Plus,
  GripVertical,
  CheckCheck,
  Play,
  Bookmark,
  Eye,
  Search,
  Film,
  Tv,
  Clapperboard,
  LayoutList,
} from 'lucide-react'
import useMovies from '../hooks/useMovies'
import { Movie, MovieStatus, addMovie } from '../lib/movies'
import { useEffect, useRef, useState } from 'react'

type TabType = 'watched' | 'watching' | 'wishlist'
type FilterType = 'todos' | 'filme' | 'série' | 'desenho'
type SortType = 'data' | 'nota'

const TYPE_ICON: Record<string, React.ReactNode> = {
  filme: <Film size={13} />,
  série: <Tv size={13} />,
  desenho: <Clapperboard size={13} />,
}

const TYPE_ICON_SM: Record<string, React.ReactNode> = {
  filme: <Film size={10} />,
  série: <Tv size={10} />,
  desenho: <Clapperboard size={10} />,
}

const TMDB_KEY = '26818979413c5eb5bd1bb9e703c239a5'

interface SearchResult {
  title: string
  poster: string | null
  year: string
  type: Movie['type']
}

async function searchTMDB(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`
    )
    const data = await res.json()
    return (data.results ?? [])
      .filter((r: any) => r.media_type !== 'person' && (r.title || r.name))
      .slice(0, 6)
      .map((r: any) => ({
        title: r.title ?? r.name,
        poster: r.poster_path ? `https://image.tmdb.org/t/p/w200${r.poster_path}` : null,
        year: (r.release_date ?? r.first_air_date ?? '').slice(0, 4),
        type: r.media_type === 'tv' ? 'série' : ('filme' as Movie['type']),
      }))
  } catch {
    return []
  }
}

// ── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
  readonly,
}: {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = hovered !== null ? hovered : value
        const full = active >= star
        const half = !full && active >= star - 0.5
        return (
          <div
            key={star}
            style={{
              position: 'relative',
              width: 18,
              height: 18,
              cursor: readonly ? 'default' : 'pointer',
            }}
            onMouseLeave={() => !readonly && setHovered(null)}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '50%',
                height: '100%',
                zIndex: 2,
              }}
              onMouseEnter={() => !readonly && setHovered(star - 0.5)}
              onClick={() => !readonly && onChange?.(star - 0.5)}
            />
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '50%',
                height: '100%',
                zIndex: 2,
              }}
              onMouseEnter={() => !readonly && setHovered(star)}
              onClick={() => !readonly && onChange?.(star)}
            />
            <Star
              size={16}
              strokeWidth={1.5}
              style={{
                color: full || half ? '#f59e0b' : '#d4aa8055',
                fill: full ? '#f59e0b' : 'none',
              }}
            />
            {half && (
              <Star
                size={16}
                strokeWidth={1.5}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  color: '#f59e0b',
                  fill: '#f59e0b',
                  clipPath: 'inset(0 50% 0 0)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Add Form ─────────────────────────────────────────────────────────────────
function AddMovieForm({
  defaultStatus,
  onAdd,
  onCancel,
  loading,
}: {
  defaultStatus: MovieStatus
  onAdd: (
    title: string,
    type: Movie['type'],
    poster: string | null,
    status: MovieStatus
  ) => Promise<void>
  onCancel: () => void
  loading: boolean
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [newType, setNewType] = useState<Movie['type']>('filme')
  const [status] = useState<MovieStatus>(defaultStatus)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (selected) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await searchTMDB(query)
      setResults(res)
      setSearching(false)
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, selected])

  const handleSelect = (r: SearchResult) => {
    setSelected(r)
    setQuery(r.title)
    setResults([])
    setNewType(r.type)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {!selected && (
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as Movie['type'])}
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(196,149,106,0.4)',
              borderRadius: 8,
              padding: '6px 6px',
              fontSize: 11,
              color: '#fdf0e0',
              fontFamily: 'Baloo 2, sans-serif',
              flexShrink: 0,
            }}
          >
            <option value="filme">🎬</option>
            <option value="série">📺</option>
            <option value="desenho">🎨</option>
          </select>
        )}
        {selected?.poster && (
          <img
            src={selected.poster}
            alt={selected.title}
            style={{ width: 26, height: 38, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
          />
        )}
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !results.length)
                onAdd(
                  selected?.title ?? query.trim(),
                  selected?.type ?? newType,
                  selected?.poster ?? null,
                  status
                )
            }}
            placeholder="buscar título..."
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(196,149,106,0.4)',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 12,
              color: '#fdf0e0',
              fontFamily: 'Baloo 2, sans-serif',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searching && (
            <div
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 10,
                color: '#c4956a',
                opacity: 0.6,
              }}
            >
              ...
            </div>
          )}
        </div>
        <button
          onClick={() =>
            onAdd(
              selected?.title ?? query.trim(),
              selected?.type ?? newType,
              selected?.poster ?? null,
              status
            )
          }
          disabled={loading || !query.trim()}
          style={{
            background: '#c4956a',
            border: 'none',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'Baloo 2, sans-serif',
            opacity: loading || !query.trim() ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          {loading ? '...' : 'ok'}
        </button>
        <button
          onClick={onCancel}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4956a' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Dropdown */}
      {results.length > 0 && (
        <div
          style={{
            background: '#2d1a0e',
            border: '1px solid rgba(196,149,106,0.3)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => handleSelect(r)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 10px',
                cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid rgba(196,149,106,0.1)' : 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(196,149,106,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div
                style={{
                  width: 26,
                  height: 38,
                  borderRadius: 4,
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                }}
              >
                {r.poster ? (
                  <img
                    src={r.poster}
                    alt={r.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Film size={14} color="#c4956a" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#fdf0e0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.title}
                </div>
                <div style={{ fontSize: 10, color: '#c4956a', opacity: 0.7 }}>
                  {r.type}
                  {r.year ? ` · ${r.year}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Movie Card — Watched ──────────────────────────────────────────────────────
function WatchedCard({
  movie,
  uid,
  partnerUid,
  displayName,
  partnerName,
  onRate,
  onChangeDate,
  onDelete,
  onChangeStatus,
}: {
  movie: Movie
  uid: string
  partnerUid: string
  displayName: string
  partnerName: string
  onRate: (id: string, stars: number, comment: string) => void
  onChangeDate: (id: string, date: string) => void
  onDelete: (id: string) => void
  onChangeStatus: (id: string, status: MovieStatus, title: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [myStars, setMyStars] = useState(movie.ratings?.[uid]?.stars ?? 0)
  const [myComment, setMyComment] = useState(movie.ratings?.[uid]?.comment ?? '')
  const [editingDate, setEditingDate] = useState(false)
  const [dateVal, setDateVal] = useState(movie.watchedAt)

  const myRating = movie.ratings?.[uid]
  const partnerRating = movie.ratings?.[partnerUid]
  const avgStars =
    myRating && partnerRating
      ? (myRating.stars + partnerRating.stars) / 2
      : (myRating?.stars ?? partnerRating?.stars ?? null)

  const dateLabel = new Date(movie.watchedAt + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 6,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          style={{
            width: 36,
            height: 52,
            borderRadius: 5,
            overflow: 'hidden',
            flexShrink: 0,
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
        >
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ color: '#c4956a', opacity: 0.6 }}>{TYPE_ICON[movie.type]}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#fdf0e0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {movie.title}
            </div>
            {(movie.watchCount ?? 1) > 1 && (
              <div
                title={`assistido ${movie.watchCount} vezes`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  background: 'rgba(127,184,127,0.15)',
                  border: '1px solid rgba(127,184,127,0.3)',
                  borderRadius: 10,
                  padding: '1px 6px',
                  flexShrink: 0,
                }}
              >
                <Eye size={9} color="#7FB87F" />
                <span style={{ fontSize: 9, fontWeight: 800, color: '#7FB87F' }}>
                  {movie.watchCount}x
                </span>
              </div>
            )}
          </div>
          <div style={{ fontSize: 10, color: '#c4956a', opacity: 0.7, marginBottom: 2 }}>
            {dateLabel}
          </div>
          {avgStars !== null && <StarRating value={avgStars} readonly />}
        </div>
        <div style={{ color: '#c4956a', opacity: 0.5 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {/* Data */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={12} color="#c4956a" />
            {editingDate ? (
              <input
                type="date"
                value={dateVal}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDateVal(e.target.value)}
                onBlur={() => {
                  onChangeDate(movie.id, dateVal)
                  setEditingDate(false)
                }}
                autoFocus
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid #c4956a',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 11,
                  color: '#fdf0e0',
                  fontFamily: 'Baloo 2, sans-serif',
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: 11,
                  color: '#c4956a',
                  cursor: 'pointer',
                  textDecoration: 'underline dotted',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingDate(true)
                }}
              >
                {dateLabel}
              </span>
            )}
          </div>

          {/* Avaliações */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#c4956a', marginBottom: 4 }}>
              {displayName}
            </div>
            <StarRating
              value={myStars}
              onChange={(v) => {
                setMyStars(v)
                onRate(movie.id, v, myComment)
              }}
            />
            <input
              placeholder="comentário (opcional)"
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              onBlur={() => onRate(movie.id, myStars, myComment)}
              onClick={(e) => e.stopPropagation()}
              style={{
                marginTop: 5,
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 7,
                padding: '4px 8px',
                fontSize: 11,
                color: '#fdf0e0',
                fontFamily: 'Baloo 2, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          {partnerRating && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#c4956a', marginBottom: 4 }}>
                {partnerName}
              </div>
              <StarRating value={partnerRating.stars} readonly />
              {partnerRating.comment && (
                <div
                  style={{
                    fontSize: 11,
                    color: '#fdf0e0',
                    opacity: 0.55,
                    marginTop: 3,
                    fontStyle: 'italic',
                  }}
                >
                  &ldquo;{partnerRating.comment}&rdquo;
                </div>
              )}
            </div>
          )}
          {myRating && partnerRating && (
            <div
              style={{
                background: 'rgba(196,149,106,0.12)',
                border: '1px solid rgba(196,149,106,0.25)',
                borderRadius: 8,
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: '#c4956a' }}>média</span>
              <StarRating value={avgStars!} readonly />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b' }}>
                {avgStars?.toFixed(1)}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onChangeStatus(movie.id, 'watching', movie.title)
              }}
              style={{
                background: 'none',
                border: '1px solid rgba(196,149,106,0.3)',
                borderRadius: 7,
                padding: '4px 10px',
                fontSize: 10,
                color: '#c4956a',
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Play size={10} /> assistir de novo
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(movie.id)
              }}
              style={{
                background: 'none',
                border: '1px solid rgba(232,96,122,0.3)',
                borderRadius: 7,
                padding: '4px 10px',
                fontSize: 10,
                color: '#e8607a',
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Trash2 size={10} /> remover
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Movie Card — Watching ─────────────────────────────────────────────────────
function WatchingCard({
  movie,
  uid,
  displayName,
  onSaveProgress,
  onDelete,
  onChangeStatus,
}: {
  movie: Movie
  uid: string
  displayName: string
  onSaveProgress: (id: string, season: number, episode: number) => void
  onDelete: (id: string) => void
  onChangeStatus: (id: string, status: MovieStatus, title: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [season, setSeason] = useState(movie.progress?.season ?? 1)
  const [episode, setEpisode] = useState(movie.progress?.episode ?? 1)

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 6,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          style={{
            width: 36,
            height: 52,
            borderRadius: 5,
            overflow: 'hidden',
            flexShrink: 0,
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
        >
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ color: '#c4956a', opacity: 0.6 }}>{TYPE_ICON[movie.type]}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#fdf0e0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {movie.title}
          </div>
          {movie.progress && movie.type !== 'filme' && (
            <div style={{ fontSize: 10, color: '#7FB87F', fontWeight: 700, marginTop: 2 }}>
              T{movie.progress.season} · E{movie.progress.episode}
            </div>
          )}
        </div>
        <div style={{ color: '#c4956a', opacity: 0.5 }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {movie.type !== 'filme' && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#c4956a', marginBottom: 6 }}>
                onde paramos
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#fdf0e0', opacity: 0.6 }}>T</span>
                  <input
                    type="number"
                    min={1}
                    value={season}
                    onChange={(e) => setSeason(Number(e.target.value))}
                    onBlur={() => onSaveProgress(movie.id, season, episode)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: 44,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(196,149,106,0.3)',
                      borderRadius: 6,
                      padding: '4px 6px',
                      fontSize: 12,
                      color: '#fdf0e0',
                      fontFamily: 'Baloo 2, sans-serif',
                      outline: 'none',
                      textAlign: 'center',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#fdf0e0', opacity: 0.6 }}>E</span>
                  <input
                    type="number"
                    min={1}
                    value={episode}
                    onChange={(e) => setEpisode(Number(e.target.value))}
                    onBlur={() => onSaveProgress(movie.id, season, episode)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: 44,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(196,149,106,0.3)',
                      borderRadius: 6,
                      padding: '4px 6px',
                      fontSize: 12,
                      color: '#fdf0e0',
                      fontFamily: 'Baloo 2, sans-serif',
                      outline: 'none',
                      textAlign: 'center',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onChangeStatus(movie.id, 'watched', movie.title)
              }}
              style={{
                background: 'linear-gradient(135deg, #7FB87F, #4A7A4A)',
                border: 'none',
                borderRadius: 7,
                padding: '5px 12px',
                fontSize: 10,
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <CheckCheck size={10} /> terminamos!
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(movie.id)
              }}
              style={{
                background: 'none',
                border: '1px solid rgba(232,96,122,0.3)',
                borderRadius: 7,
                padding: '4px 10px',
                fontSize: 10,
                color: '#e8607a',
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Trash2 size={10} /> remover
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Movie Card — Wishlist ─────────────────────────────────────────────────────
function WishlistCard({
  movie,
  onDelete,
  onChangeStatus,
  dragHandleProps,
}: {
  movie: Movie
  onDelete: (id: string) => void
  onChangeStatus: (id: string, status: MovieStatus, title: string) => void
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
      }}
    >
      <div
        {...dragHandleProps}
        style={{ color: '#c4956a', opacity: 0.35, cursor: 'grab', flexShrink: 0 }}
      >
        <GripVertical size={14} />
      </div>
      <div
        style={{
          width: 32,
          height: 46,
          borderRadius: 4,
          overflow: 'hidden',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
        }}
      >
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ color: '#c4956a', opacity: 0.6 }}>{TYPE_ICON[movie.type]}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#fdf0e0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {movie.title}
        </div>
        <div
          style={{
            fontSize: 10,
            color: '#c4956a',
            opacity: 0.6,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {TYPE_ICON_SM[movie.type]} {movie.type}
        </div>
      </div>
      <button
        onClick={() => onChangeStatus(movie.id, 'watching', movie.title)}
        style={{
          background: 'rgba(127,184,127,0.15)',
          border: '1px solid rgba(127,184,127,0.3)',
          borderRadius: 7,
          padding: '4px 8px',
          fontSize: 10,
          color: '#7FB87F',
          cursor: 'pointer',
          fontFamily: 'Baloo 2, sans-serif',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          flexShrink: 0,
        }}
      >
        <Play size={9} /> assistir
      </button>
      <button
        onClick={() => onDelete(movie.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#e8607a',
          opacity: 0.5,
          padding: 2,
          flexShrink: 0,
        }}
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface Props {
  uid: string
  partnerUid: string
  displayName: string
  partnerName: string
  onClose: () => void
}

export default function MovieList({ uid, partnerUid, displayName, partnerName, onClose }: Props) {
  const {
    movies,
    addNewMovie,
    rateMovie,
    changeStatus,
    changeDate,
    saveProgress,
    removeMovie,
    reorderWishlistMovies,
  } = useMovies(uid, displayName)
  const [tab, setTab] = useState<TabType>('watched')
  const [filter, setFilter] = useState<FilterType>('todos')
  const [sort, setSort] = useState<SortType>('data')
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [duplicate, setDuplicate] = useState<{ title: string; status: MovieStatus } | null>(null)
  const [search, setSearch] = useState('')

  // Drag state para wishlist
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)

  const searchLower = search.toLowerCase()

  const watched = movies
    .filter(
      (m) =>
        m.status === 'watched' &&
        (filter === 'todos' || m.type === filter) &&
        (!search || m.title.toLowerCase().includes(searchLower))
    )
    .sort((a, b) =>
      sort === 'data'
        ? b.watchedAt !== a.watchedAt
          ? b.watchedAt.localeCompare(a.watchedAt)
          : (b.watchedAtMs ?? 0) - (a.watchedAtMs ?? 0)
        : (() => {
            const avgA =
              Object.values(a.ratings ?? {}).reduce((s, r) => s + r.stars, 0) /
              Math.max(1, Object.values(a.ratings ?? {}).length)
            const avgB =
              Object.values(b.ratings ?? {}).reduce((s, r) => s + r.stars, 0) /
              Math.max(1, Object.values(b.ratings ?? {}).length)
            return avgB - avgA
          })()
    )

  const watching = movies.filter(
    (m) =>
      m.status === 'watching' &&
      (filter === 'todos' || m.type === filter) &&
      (!search || m.title.toLowerCase().includes(searchLower))
  )

  const wishlist = movies
    .filter(
      (m) =>
        m.status === 'wishlist' &&
        (filter === 'todos' || m.type === filter) &&
        (!search || m.title.toLowerCase().includes(searchLower))
    )
    .sort((a, b) => (a.wishlistOrder ?? 0) - (b.wishlistOrder ?? 0))

  // Agrupar watched por mês
  const grouped: { label: string; items: Movie[] }[] = []
  if (sort === 'data') {
    watched.forEach((m) => {
      const d = new Date(m.watchedAt + 'T12:00:00')
      const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      const last = grouped[grouped.length - 1]
      if (last?.label === label) {
        last.items.push(m)
      } else {
        grouped.push({ label, items: [m] })
      }
    })
  }

  // Drag wishlist
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return
    const reordered = [...wishlist]
    const dragged = reordered.splice(dragItem.current, 1)[0]
    reordered.splice(dragOver.current, 0, dragged)
    dragItem.current = null
    dragOver.current = null
    reorderWishlistMovies(reordered)
  }

  const TABS: { key: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    {
      key: 'watched',
      label: 'assistidos',
      icon: <CheckCheck size={13} />,
      count: movies.filter((m) => m.status === 'watched').length,
    },
    {
      key: 'watching',
      label: 'assistindo',
      icon: <Play size={13} />,
      count: movies.filter((m) => m.status === 'watching').length,
    },
    {
      key: 'wishlist',
      label: 'quero ver',
      icon: <Bookmark size={13} />,
      count: movies.filter((m) => m.status === 'wishlist').length,
    },
  ]

  const statusForTab: Record<TabType, MovieStatus> = {
    watched: 'watched',
    watching: 'watching',
    wishlist: 'wishlist',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(26,18,8,0.6)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440,
          maxHeight: '88vh',
          background: 'linear-gradient(160deg, #2d1a0e 0%, #3d2408 100%)',
          border: '1.5px solid #8b5a2a',
          borderRadius: 20,
          boxShadow: '0 12px 48px rgba(26,18,8,0.6)',
          fontFamily: 'Baloo 2, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 16px 10px',
            borderBottom: '1px solid rgba(139,90,42,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <LayoutList size={16} color="#c4956a" />
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fdf0e0' }}>filmes & séries</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4956a' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Abas */}
        <div style={{ display: 'flex', padding: '8px 12px 0', gap: 4, flexShrink: 0 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key)
                setAdding(false)
              }}
              style={{
                flex: 1,
                padding: '7px 4px',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                background: tab === t.key ? 'rgba(196,149,106,0.15)' : 'transparent',
                color: tab === t.key ? '#f5ecd7' : '#c4956a',
                borderBottom: tab === t.key ? '2px solid #c4956a' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                transition: 'all 0.15s',
              }}
            >
              {t.icon} {t.label}
              {t.count > 0 && (
                <span
                  style={{
                    background: 'rgba(196,149,106,0.25)',
                    borderRadius: 10,
                    padding: '0 5px',
                    fontSize: 9,
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Busca global */}
        <div style={{ padding: '4px 12px 0', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={12}
              color="#c4956a"
              style={{
                position: 'absolute',
                left: 9,
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.6,
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="buscar na lista..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(196,149,106,0.25)',
                borderRadius: 9,
                padding: '5px 10px 5px 28px',
                fontSize: 11,
                color: '#fdf0e0',
                fontFamily: 'Baloo 2, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 7,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#c4956a',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Filtros — só em watched */}
        {tab === 'watched' && (
          <div
            style={{
              padding: '8px 12px 4px',
              display: 'flex',
              gap: 4,
              flexShrink: 0,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {(
              [
                { key: 'todos', label: 'todos', icon: null },
                { key: 'filme', label: 'filme', icon: <Film size={10} /> },
                { key: 'série', label: 'série', icon: <Tv size={10} /> },
                { key: 'desenho', label: 'desenho', icon: <Clapperboard size={10} /> },
              ] as { key: FilterType; label: string; icon: React.ReactNode }[]
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 20,
                  border: 'none',
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'Baloo 2, sans-serif',
                  cursor: 'pointer',
                  background: filter === f.key ? '#c4956a' : 'rgba(255,255,255,0.06)',
                  color: filter === f.key ? '#fff' : '#c4956a',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {f.icon} {f.label}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
              {(['data', 'nota'] as SortType[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 20,
                    border: '1px solid rgba(196,149,106,0.25)',
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: 'Baloo 2, sans-serif',
                    cursor: 'pointer',
                    background: sort === s ? 'rgba(196,149,106,0.18)' : 'none',
                    color: '#c4956a',
                  }}
                >
                  {s === 'data' ? 'recente' : 'nota'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Adicionar */}
        <div style={{ padding: '6px 12px 8px', flexShrink: 0 }}>
          {adding ? (
            <AddMovieForm
              defaultStatus={statusForTab[tab]}
              onAdd={async (title, type, poster, status) => {
                setLoading(true)
                try {
                  const result = await addNewMovie(title, type, poster, status)
                  if (result === 'duplicate') {
                    const found = movies.find((m) => m.title.toLowerCase() === title.toLowerCase())
                    if (found) {
                      console.log('setando duplicate com status:', found.status)
                      setDuplicate({ title: found.title, status: found.status })
                    }
                  } else {
                    setAdding(false)
                  }
                } catch (err) {
                  console.error('Erro ao salvar filme:', err)
                } finally {
                  setLoading(false)
                }
              }}
              onCancel={() => setAdding(false)}
              loading={loading}
            />
          ) : (
            <button
              onClick={() => setAdding(true)}
              style={{
                width: '100%',
                padding: '7px',
                borderRadius: 10,
                border: '1.5px dashed rgba(196,149,106,0.35)',
                background: 'none',
                color: '#c4956a',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <Plus size={13} /> adicionar
            </button>
          )}
        </div>

        {/* Modal duplicata */}
        {duplicate && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(26,18,8,0.75)',
              borderRadius: 20,
            }}
          >
            <div
              style={{
                background: 'linear-gradient(160deg, #2d1a0e 0%, #3d2408 100%)',
                border: '1.5px solid #8b5a2a',
                borderRadius: 16,
                padding: '20px 22px',
                maxWidth: 300,
                textAlign: 'center',
                fontFamily: 'Baloo 2, sans-serif',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fdf0e0', marginBottom: 6 }}>
                título já adicionado
              </div>
              <div style={{ fontSize: 11, color: '#c4956a', marginBottom: 16, lineHeight: 1.5 }}>
                <strong style={{ color: '#fdf0e0' }}>{duplicate.title}</strong> já está como{' '}
                <strong style={{ color: '#f59e0b' }}>
                  {duplicate.status === 'watched'
                    ? 'assistido'
                    : duplicate.status === 'watching'
                      ? 'assistindo'
                      : 'quero ver'}
                </strong>
                . deseja adicionar de novo?
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button
                  onClick={() => setDuplicate(null)}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(196,149,106,0.4)',
                    borderRadius: 9,
                    padding: '6px 16px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#c4956a',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  cancelar
                </button>
                <button
                  onClick={async () => {
                    const found = movies.find((m) => m.title === duplicate.title)
                    if (!found) return
                    setDuplicate(null)
                    setLoading(true)
                    try {
                      const newStatus = statusForTab[tab]
                      const wishlistCount = movies.filter((m) => m.status === 'wishlist').length
                      const now = new Date()
                      const allWithTitle = movies.filter(
                        (m) => m.title.toLowerCase() === found.title.toLowerCase()
                      )
                      const maxCount = Math.max(...allWithTitle.map((m) => m.watchCount ?? 0))
                      const newMovie: Omit<Movie, 'id'> = {
                        title: found.title,
                        poster: found.poster ?? null,
                        type: found.type,
                        status: newStatus,
                        watchedAt: now.toISOString().split('T')[0],
                        watchedAtMs: newStatus === 'watched' ? now.getTime() : 0,
                        createdAt: now.toISOString(),
                        ratings: {},
                        watchCount: newStatus === 'watched' ? maxCount + 1 : 0,
                      }
                      if (newStatus === 'wishlist') newMovie.wishlistOrder = wishlistCount
                      await addMovie(newMovie)
                      setAdding(false)
                    } catch (err) {
                      console.error('Erro ao duplicar filme:', err)
                    } finally {
                      setLoading(false)
                    }
                  }}
                  style={{
                    background: '#c4956a',
                    border: 'none',
                    borderRadius: 9,
                    padding: '6px 16px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fff',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2, sans-serif',
                  }}
                >
                  adicionar mesmo assim
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 14px' }}>
          {/* Watched */}
          {tab === 'watched' &&
            (watched.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: '#c4956a',
                  opacity: 0.4,
                  fontSize: 12,
                  padding: '28px 0',
                }}
              >
                nenhum título assistido ainda
              </div>
            ) : sort === 'data' ? (
              grouped.map((group) => (
                <div key={group.label}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      color: '#c4956a',
                      opacity: 0.55,
                      textTransform: 'capitalize',
                      padding: '8px 2px 5px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {group.label}
                  </div>
                  {group.items.map((m) => (
                    <WatchedCard
                      key={m.id}
                      movie={m}
                      uid={uid}
                      partnerUid={partnerUid}
                      displayName={displayName}
                      partnerName={partnerName}
                      onRate={(id, stars, comment) => rateMovie(id, { stars, comment })}
                      onChangeDate={changeDate}
                      onDelete={removeMovie}
                      onChangeStatus={changeStatus}
                    />
                  ))}
                </div>
              ))
            ) : (
              watched.map((m) => (
                <WatchedCard
                  key={m.id}
                  movie={m}
                  uid={uid}
                  partnerUid={partnerUid}
                  displayName={displayName}
                  partnerName={partnerName}
                  onRate={(id, stars, comment) => rateMovie(id, { stars, comment })}
                  onChangeDate={changeDate}
                  onDelete={removeMovie}
                  onChangeStatus={changeStatus}
                />
              ))
            ))}

          {/* Watching */}
          {tab === 'watching' &&
            (watching.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: '#c4956a',
                  opacity: 0.4,
                  fontSize: 12,
                  padding: '28px 0',
                }}
              >
                nenhum título em andamento
              </div>
            ) : (
              watching.map((m) => (
                <WatchingCard
                  key={m.id}
                  movie={m}
                  uid={uid}
                  displayName={displayName}
                  onSaveProgress={(id, s, e) => saveProgress(id, { season: s, episode: e })}
                  onDelete={removeMovie}
                  onChangeStatus={changeStatus}
                />
              ))
            ))}

          {/* Wishlist */}
          {tab === 'wishlist' &&
            (wishlist.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: '#c4956a',
                  opacity: 0.4,
                  fontSize: 12,
                  padding: '28px 0',
                }}
              >
                lista vazia — o que querem assistir?
              </div>
            ) : (
              wishlist.map((m, i) => (
                <WishlistCard
                  key={m.id}
                  movie={m}
                  onDelete={removeMovie}
                  onChangeStatus={changeStatus}
                  dragHandleProps={{
                    draggable: true,
                    onDragStart: () => {
                      dragItem.current = i
                    },
                    onDragEnter: () => {
                      dragOver.current = i
                    },
                    onDragEnd: handleDragEnd,
                    onDragOver: (e) => e.preventDefault(),
                  }}
                />
              ))
            ))}
        </div>
      </div>
    </div>
  )
}
