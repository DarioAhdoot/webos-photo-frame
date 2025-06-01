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
          Digital Photo Frame
        </h1>
        <p className="text-xl text-dark-muted mb-8 max-w-2xl">
          Transform your TV into a beautiful digital photo frame. Connect to your Immich server to display your favorite photos with customizable slideshows.
        </p>
        <p className="text-lg text-blue-400 animate-pulse">
          Click anywhere to set up photo sources
        </p>
      </div>
    </div>
  )
}