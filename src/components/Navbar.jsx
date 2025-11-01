import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className='bg-dprBlue text-white shadow-md'>
      <div className='max-w-6xl mx-auto px-6 py-4 flex justify-between items-center'>
        <h1 className='text-lg md:text-xl font-semibold tracking-wide'>Absensi Magang DPR RI</h1>
        <div className='space-x-6 text-sm md:text-base'>
          <Link to='/absensi' className='hover:text-dprGold transition'>Absen</Link>
          <Link to='/riwayat' className='hover:text-dprGold transition'>Riwayat</Link>
        </div>
        </div> 
    </nav>
  );
}

export default Navbar;