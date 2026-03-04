import React from 'react'
import styles from './style.module.css'

const slides = [
  {
    image: '/images/ram.jpeg',
    caption: 'Explore Uttar Pradesh',
    sub: 'Discover iconic landmarks through immersive audio tours',
  },
  {
    image: '/images/agra.png',
    caption: 'Agra Fort',
    sub: 'Walk through centuries of Mughal history',
  },
  {
    image: '/images/homepage.jpeg',
    caption: 'Rich Heritage',
    sub: 'Stories brought to life in your language',
  },
]

const ImageCarousal = () => {
  const [active, setActive] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={styles.imageCarousal}>
      <div className={styles.imageContainer}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`${styles.slide} ${i === active ? styles.slideActive : ''}`}
          >
            <img
              src={slide.image}
              alt={slide.caption}
              className={styles.slideImg}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/ram.jpeg'
              }}
            />
            <div className={styles.slideOverlay}>
              <p className={styles.slideCaption}>{slide.caption}</p>
              <p className={styles.slideSub}>{slide.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <ul className={styles.carousalDots}>
        {slides.map((_, i) => (
          <li
            key={i}
            onClick={() => setActive(i)}
            className={`${styles.carousalDot} ${i === active ? styles['carousalDot--active'] : ''}`}
          />
        ))}
      </ul>
    </div>
  )
}

export default ImageCarousal
