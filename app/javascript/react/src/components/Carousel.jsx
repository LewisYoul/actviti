import React from 'react'

const Carousel = () => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [urls, setUrls] = React.useState()
  const [url, setUrl] = React.useState()

  React.useEffect(() => {
    window.addEventListener('openCarousel', (event) => {
      setUrls(event.detail.urls)
      setUrl(event.detail.url)
    })
  }, [])

  React.useEffect(() => {
    if (urls && url) {
      setIsVisible(true)
    }
  }, [urls, url])

  const closeCarousel = () => {
    setUrls(null)
    setUrl(null)
    setIsVisible(false)
  }

  const nextImage = () => {
    const currentIndex = urls.indexOf(url)
    const nextIndex = (currentIndex + 1) > urls.length - 1 ? 0 : (currentIndex + 1)
    setUrl(urls[nextIndex])
  }

  const previousImage = () => {
    const currentIndex = urls.indexOf(url)
    const previousIndex = (currentIndex - 1) < 0 ? urls.length - 1 : (currentIndex - 1)
    setUrl(urls[previousIndex])
  }

  return (
    <div className={`${isVisible ? '' : 'hidden'} z-1100 fixed h-full w-full inset-0 z-50 bg-black bg-opacity-90`}>
      <div className="flex items-center justify-center w-full h-full">
        <div className="h-5/6 w-5/6">
          <img className="object-contain h-full w-full" src={url} />
        </div>
      </div>

      <svg onClick={closeCarousel} className="text-white hover:text-gray-400 absolute top-0 right-0 cursor-pointer w-12 h-12 pr-4 pt-4 w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>

      <svg onClick={nextImage} className="absolute top-1/2 left-0 text-white hover:text-gray-400 w-12 h-12 pl-4 cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>

      <svg onClick={previousImage} className="absolute top-1/2 cursor-pointer right-0 text-white hover:text-gray-400 w-12 h-12 pr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </div>
  )
}

export default Carousel;