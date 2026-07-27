const ScreenLayout = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#10002b] px-4 pt-3 pb-24">
      <div className="mx-auto w-full max-w-md">
        {children}
      </div>
    </div>
  );
};

export default ScreenLayout;