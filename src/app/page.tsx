'use client'

import { useEffect, useState, useCallback } from 'react'

// 定义游戏配置
const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }
const INITIAL_FOOD = { x: 5, y: 5 }
const GAME_SPEED = 150

export default function Home() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [direction, setDirection] = useState(INITIAL_DIRECTION)
  const [food, setFood] = useState(INITIAL_FOOD)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // 生成新的食物位置
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
    setFood(newFood)
  }, [])

  // 检查碰撞
  const checkCollision = useCallback((head: { x: number; y: number }) => {
    // 检查是否撞墙
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true
    }
    // 检查是否撞到自己
    return snake.slice(1).some(segment => 
      segment.x === head.x && segment.y === head.y
    )
  }, [snake])

  // 游戏主循环
  useEffect(() => {
    if (gameOver || isPaused) return

    const moveSnake = () => {
      setSnake(currentSnake => {
        const head = currentSnake[0]
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y
        }

        if (checkCollision(newHead)) {
          setGameOver(true)
          return currentSnake
        }

        const newSnake = [newHead, ...currentSnake]

        // 检查是否吃到食物
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 1)
          generateFood()
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }

    const gameInterval = setInterval(moveSnake, GAME_SPEED)
    return () => clearInterval(gameInterval)
  }, [direction, food, gameOver, isPaused, checkCollision, generateFood])

  // 键盘控制
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 })
          break
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 })
          break
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 })
          break
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 })
          break
        case ' ':
          setIsPaused(p => !p)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, gameOver])

  // 重置游戏
  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    generateFood()
    setGameOver(false)
    setScore(0)
    setIsPaused(false)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="mb-4 text-2xl font-bold">得分: {score}</div>
      <div 
        className="relative bg-white border-2 border-gray-400"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE
        }}
      >
        {/* 蛇身 */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute bg-green-500"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              borderRadius: index === 0 ? '4px' : '0'
            }}
          />
        ))}
        {/* 食物 */}
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE
          }}
        />
      </div>
      {gameOver && (
        <div className="mt-4 text-xl text-red-500 font-bold">
          游戏结束！
        </div>
      )}
      <button
        onClick={resetGame}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {gameOver ? '重新开始' : '重置游戏'}
      </button>
      <div className="mt-4 text-gray-600">
        使用方向键控制蛇的移动，空格键暂停游戏
      </div>
    </main>
  )
}
