import { Bell, MessageSquare, Grid, Calendar, Phone, User, Settings } from "lucide-react";

const NavigationSidebar = ({
    activeTab,
    setActiveTab
  }: {
    activeTab: string,
    setActiveTab: (tab: string) => void
  }) => {
    const navItems = [
      { id: 'activity', icon: Bell, label: 'Activity' },
      { id: 'chat', icon: MessageSquare, label: 'Chat' },
      { id: 'teams', icon: Grid, label: 'Teams' },
      { id: 'calendar', icon: Calendar, label: 'Calendar' },
      { id: 'calls', icon: Phone, label: 'Calls' },
    ];
  
    return (
      <div className="w-16 bg-[#2b2a2c] flex flex-col items-center text-white">
        {/* User avatar */}
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center my-4 cursor-pointer">
          <User size={20} />
        </div>
  
        {/* Nav items */}
        <div className="flex-1 flex flex-col items-center w-full">
          {navItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex flex-col items-center py-3 cursor-pointer relative
                ${activeTab === item.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>
              )}
              <item.icon size={22} />
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          ))}
        </div>
  
        {/* Settings */}
        <div className="mb-4 w-full flex flex-col items-center py-3 cursor-pointer text-gray-400 hover:text-gray-200">
          <Settings size={22} />
          <span className="text-xs mt-1">Settings</span>
        </div>
      </div>
    );
  };

  export default  NavigationSidebar;