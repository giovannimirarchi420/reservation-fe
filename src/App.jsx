import React, { useState } from 'react';
import MainLayout from './components/Layout/MainLayout';
import BookingCalendar from './components/Booking/BookingCalendar';
import AdminPanel from './components/Admin/AdminPanel';

const App = () => {
  const [currentSection, setCurrentSection] = useState('calendar');

  const renderContent = () => {
    switch (currentSection) {
      case 'calendar':
        return <BookingCalendar />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <BookingCalendar />;
    }
  };

  return (
    <MainLayout 
      currentSection={currentSection} 
      onSectionChange={setCurrentSection}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default App;
