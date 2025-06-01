interface WelcomeScreenProps {
  onSetupPhotoSources: () => void
}

export default function WelcomeScreen({ onSetupPhotoSources }: WelcomeScreenProps) {
  return (
    <div 
      className="h-screen w-screen bg-dark-bg flex items-center justify-center cursor-pointer"
      onClick={onSetupPhotoSources}
    >
      <div className="text-center px-8">
        <h1 className="text-4xl font-bold text-dark-text mb-6">
          Welcome to Photo Slideshow
        </h1>
        <p className="text-xl text-dark-muted mb-8 max-w-2xl">
          To get started, you'll need to set up photo sources from your Immich server.
        </p>
        <p className="text-lg text-blue-400 animate-pulse">
          Click anywhere to set up photo sources
        </p>
      </div>
    </div>
  )
}