import { ref, push, set, onValue, off, remove, get } from 'firebase/database'
import { db } from './firebase'

export type MovieStatus = 'watched' | 'watching' | 'wishlist'

export interface MovieRating {
  stars: number
  comment: string
}

export interface MovieProgress {
  season: number
  episode: number
}

export interface Movie {
  id: string
  title: string
  poster: string | null
  type: 'filme' | 'série' | 'desenho'
  status: MovieStatus
  watchedAt: string
  watchedAtMs?: number
  createdAt: string
  ratings: Record<string, MovieRating>
  progress?: MovieProgress
  wishlistOrder?: number
  watchCount?: number
}

const PATH = 'movies'
const TMDB_KEY = '26818979413c5eb5bd1bb9e703c239a5'

export async function addMovie(movie: Omit<Movie, 'id'>): Promise<void> {
  const result = await push(ref(db, PATH), movie)
  if (!result.key) throw new Error('Firebase não gerou chave para o item')
}

export async function updateMovieField(
  movieId: string,
  field: string,
  value: unknown
): Promise<void> {
  await set(ref(db, `${PATH}/${movieId}/${field}`), value)
}

export async function updateMovieRating(
  movieId: string,
  uid: string,
  rating: MovieRating
): Promise<void> {
  await set(ref(db, `${PATH}/${movieId}/ratings/${uid}`), rating)
}

export async function deleteMovie(movieId: string): Promise<void> {
  await remove(ref(db, `${PATH}/${movieId}`))
}

export async function reorderWishlist(movies: Movie[]): Promise<void> {
  const updates: Promise<void>[] = movies.map((m, i) =>
    set(ref(db, `${PATH}/${m.id}/wishlistOrder`), i)
  )
  await Promise.all(updates)
}

export function subscribeMovies(callback: (movies: Movie[]) => void): () => void {
  const r = ref(db, PATH)
  onValue(r, (snap) => {
    const val = snap.val() as Record<string, Omit<Movie, 'id'>> | null
    if (!val) return callback([])
    const list = Object.entries(val).map(([id, m]) => {
      const movie = { ...m, id }
      if (!movie.status) movie.status = 'watched' as MovieStatus
      return movie
    })
    callback(list)
  })
  return () => off(r, 'value')
}
