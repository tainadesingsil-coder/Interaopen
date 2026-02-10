export const LoadingSkeleton = () => (
  <div className='glass-panel p-6 md:p-8'>
    <div className='space-y-4'>
      <div className='skeleton h-4 w-40 rounded-full' />
      <div className='skeleton h-8 w-3/4 rounded-full' />
      <div className='skeleton h-4 w-2/3 rounded-full' />
      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='skeleton h-12 rounded-xl' />
        <div className='skeleton h-12 rounded-xl' />
        <div className='skeleton h-12 rounded-xl sm:col-span-2' />
        <div className='skeleton h-12 rounded-xl' />
        <div className='skeleton h-12 rounded-xl' />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div className='skeleton h-14 rounded-2xl' />
        <div className='skeleton h-14 rounded-2xl' />
        <div className='skeleton h-14 rounded-2xl' />
        <div className='skeleton h-14 rounded-2xl' />
      </div>
    </div>
  </div>
);
