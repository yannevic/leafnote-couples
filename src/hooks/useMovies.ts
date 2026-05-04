import { useState, useEffect, useCallback } from 'react'
import {
  Movie,
  MovieRating,
  MovieProgress,
  MovieStatus,
  subscribeMovies,
  addMovie,
  updateMovieField,
  updateMovieRating,
  trashMovie,
  restoreMovie,
  deleteMoviePermanently,
  reorderWishlist,
} from '../lib/movies'
import { addCalendarEvent, toDateKey } from '../lib/calendar'

export default function useMovies(coupleId: string, uid: string, displayName: string) {
  const [movies, setMovies] = useState<Movie[]>([])

  useEffect(() => {
    return subscribeMovies(coupleId, setMovies)
  }, [coupleId])

  const addNewMovie = useCallback(
    async (
      title: string,
      type: Movie['type'],
      poster: string | null,
      status: MovieStatus
    ): Promise<'duplicate_same' | 'duplicate_other' | 'ok'> => {
      const existing = movies.find((m) => m.title.toLowerCase() === title.toLowerCase())
      if (existing) {
        if (status !== 'watched') {
          return existing.status === status ? 'duplicate_same' : 'duplicate_other'
        }
        if (existing.status !== 'watched') {
          return 'duplicate_other'
        }
      }

      const today = new Date().toISOString().split('T')[0]
      const now = new Date()
      const wishlistCount = movies.filter((m) => m.status === 'wishlist').length
      const movie: Omit<Movie, 'id'> = {
        title,
        poster,
        type,
        status,
        watchedAt: today,
        watchedAtMs: status === 'watched' ? now.getTime() : 0,
        createdAt: now.toISOString(),
        ratings: {},
        watchCount: status === 'watched' ? 1 : 0,
        ...(status === 'wishlist' && { wishlistOrder: wishlistCount }),
      }

      await addMovie(coupleId, movie)

      if (status === 'watched') {
        const [year, month, day] = today.split('-').map(Number)
        const dateKey = toDateKey(year, month - 1, day)
        await addCalendarEvent(coupleId, dateKey, {
          text: `🎬 assistimos: ${title}`,
          time: null,
          createdBy: displayName,
        })
      }
      return 'ok'
    },
    [displayName, movies]
  )

  const rateMovie = useCallback(
    async (movieId: string, rating: MovieRating) => {
      await updateMovieRating(coupleId, movieId, uid, rating)
    },
    [coupleId, uid]
  )

  const changeStatus = useCallback(
    async (movieId: string, status: MovieStatus, title: string) => {
      await updateMovieField(coupleId, movieId, 'status', status)
      if (status === 'watched') {
        const today = new Date().toISOString().split('T')[0]
        await updateMovieField(coupleId, movieId, 'watchedAt', today)
        await updateMovieField(coupleId, movieId, 'watchedAtMs', Date.now())
        const found = movies.find((m) => m.id === movieId)
        const allWithTitle = movies.filter(
          (m) => m.title.toLowerCase() === (found?.title ?? '').toLowerCase()
        )
        const maxCount = Math.max(...allWithTitle.map((m) => m.watchCount ?? 0))
        const newCount = maxCount + 1
        await updateMovieField(coupleId, movieId, 'watchCount', newCount)
        const [year, month, day] = today.split('-').map(Number)
        const dateKey = toDateKey(year, month - 1, day)
        await addCalendarEvent(coupleId, dateKey, {
          text: `🎬 assistimos: ${title}`,
          time: null,
          createdBy: displayName,
        })
      }
    },
    [coupleId, displayName, movies]
  )

  const changeDate = useCallback(
    async (movieId: string, date: string) => {
      await updateMovieField(coupleId, movieId, 'watchedAt', date)
    },
    [coupleId]
  )

  const saveProgress = useCallback(
    async (movieId: string, progress: MovieProgress) => {
      await updateMovieField(coupleId, movieId, 'progress', progress)
    },
    [coupleId]
  )

  const removeMovie = useCallback(
    async (movieId: string) => {
      await trashMovie(coupleId, movieId)
    },
    [coupleId]
  )

  const restoreMovieById = useCallback(
    async (movieId: string) => {
      await restoreMovie(coupleId, movieId)
    },
    [coupleId]
  )

  const deleteMovieForever = useCallback(
    async (movieId: string) => {
      await deleteMoviePermanently(coupleId, movieId)
    },
    [coupleId]
  )

  const reorderWishlistMovies = useCallback(
    async (ordered: Movie[]) => {
      await reorderWishlist(coupleId, ordered)
    },
    [coupleId]
  )

  return {
    movies,
    addNewMovie,
    rateMovie,
    changeStatus,
    changeDate,
    saveProgress,
    removeMovie,
    restoreMovieById,
    deleteMovieForever,
    reorderWishlistMovies,
  }
}
