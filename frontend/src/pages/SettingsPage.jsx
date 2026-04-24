
// import { THEMES } from "../constants";
// import { useThemeStore } from "../store/useThemeStore";
// import { useAuthStore } from "../store/useAuthStore";
// import { Send, User, Lock, Bell, Shield, Palette } from "lucide-react";
// import { useState } from "react";

// const PREVIEW_MESSAGES = [
//   { id: 1, content: "Hey! How's it going?", isSent: false },
//   { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
// ];

// const SIDEBAR_ITEMS = [
//   { id: "profile", label: "Profile", icon: User },
//   { id: "account", label: "Account", icon: Lock },
//   { id: "privacy", label: "Privacy", icon: Shield },
//   { id: "notifications", label: "Notifications", icon: Bell },
//   { id: "theme", label: "Theme", icon: Palette },
// ];

// const SettingsPage = () => {
//   const { theme, setTheme } = useThemeStore();
//   const { authUser } = useAuthStore();
//   const [activeSection, setActiveSection] = useState("profile");

//   // Profile state
//   const [name, setName] = useState(authUser?.fullName || "");
//   const [bio, setBio] = useState(authUser?.bio || "");

//   // Account state
//   const [email, setEmail] = useState(authUser?.email || "");
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");

//   // Privacy state
//   const [lastSeen, setLastSeen] = useState("everyone");
//   const [profilePhoto, setProfilePhoto] = useState("everyone");

//   // Notifications state
//   const [messageAlerts, setMessageAlerts] = useState(true);
//   const [sounds, setSounds] = useState(true);

//   const renderSection = () => {
//     switch (activeSection) {
//       case "profile":
//         return (
//           <div className="space-y-6">
//             <h2 className="text-lg font-semibold">Profile</h2>

//             {/* Avatar */}
//             <div className="flex flex-col items-center gap-3">
//               <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-content text-3xl font-bold">
//                 {name?.charAt(0).toUpperCase() || "U"}
//               </div>
//               <button className="btn btn-sm btn-outline">Change Photo</button>
//             </div>

//             {/* Name */}
//             <div className="form-control gap-1">
//               <label className="label-text font-medium">Full Name</label>
//               <input
//                 type="text"
//                 className="input input-bordered w-full"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="Your name"
//               />
//             </div>

//             {/* Bio */}
//             <div className="form-control gap-1">
//               <label className="label-text font-medium">Bio</label>
//               <textarea
//                 className="textarea textarea-bordered w-full"
//                 value={bio}
//                 onChange={(e) => setBio(e.target.value)}
//                 placeholder="Write something about yourself..."
//                 rows={3}
//               />
//             </div>

//             <button className="btn btn-primary w-full">Save Changes</button>
//           </div>
//         );

//       case "account":
//         return (
//           <div className="space-y-6">
//             <h2 className="text-lg font-semibold">Account</h2>

//             {/* Email */}
//             <div className="form-control gap-1">
//               <label className="label-text font-medium">Email Address</label>
//               <input
//                 type="email"
//                 className="input input-bordered w-full"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>

//             <div className="divider">Change Password</div>

//             <div className="form-control gap-1">
//               <label className="label-text font-medium">Current Password</label>
//               <input
//                 type="password"
//                 className="input input-bordered w-full"
//                 value={currentPassword}
//                 onChange={(e) => setCurrentPassword(e.target.value)}
//                 placeholder="Enter current password"
//               />
//             </div>

//             <div className="form-control gap-1">
//               <label className="label-text font-medium">New Password</label>
//               <input
//                 type="password"
//                 className="input input-bordered w-full"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 placeholder="Enter new password"
//               />
//             </div>

//             <button className="btn btn-primary w-full">Update Account</button>
//           </div>
//         );

//       case "privacy":
//         return (
//           <div className="space-y-6">
//             <h2 className="text-lg font-semibold">Privacy</h2>

//             <div className="form-control gap-1">
//               <label className="label-text font-medium">Last Seen</label>
//               <select
//                 className="select select-bordered w-full"
//                 value={lastSeen}
//                 onChange={(e) => setLastSeen(e.target.value)}
//               >
//                 <option value="everyone">Everyone</option>
//                 <option value="contacts">My Contacts</option>
//                 <option value="nobody">Nobody</option>
//               </select>
//             </div>

//             <div className="form-control gap-1">
//               <label className="label-text font-medium">Profile Photo</label>
//               <select
//                 className="select select-bordered w-full"
//                 value={profilePhoto}
//                 onChange={(e) => setProfilePhoto(e.target.value)}
//               >
//                 <option value="everyone">Everyone</option>
//                 <option value="contacts">My Contacts</option>
//                 <option value="nobody">Nobody</option>
//               </select>
//             </div>

//             <button className="btn btn-primary w-full">Save Privacy Settings</button>
//           </div>
//         );

//       case "notifications":
//         return (
//           <div className="space-y-6">
//             <h2 className="text-lg font-semibold">Notifications</h2>

//             <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
//               <div>
//                 <p className="font-medium">Message Alerts</p>
//                 <p className="text-sm text-base-content/70">Get notified for new messages</p>
//               </div>
//               <input
//                 type="checkbox"
//                 className="toggle toggle-primary"
//                 checked={messageAlerts}
//                 onChange={(e) => setMessageAlerts(e.target.checked)}
//               />
//             </div>

//             <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
//               <div>
//                 <p className="font-medium">Notification Sounds</p>
//                 <p className="text-sm text-base-content/70">Play sound for new messages</p>
//               </div>
//               <input
//                 type="checkbox"
//                 className="toggle toggle-primary"
//                 checked={sounds}
//                 onChange={(e) => setSounds(e.target.checked)}
//               />
//             </div>
//           </div>
//         );

//       case "theme":
//         return (
//           <div className="space-y-6">
//             <h2 className="text-lg font-semibold">Theme</h2>
//             <p className="text-sm text-base-content/70">Choose a theme for your chat interface</p>

//             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
//               {THEMES.map((t) => (
//                 <button
//                   key={t}
//                   className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
//                     ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}`}
//                   onClick={() => setTheme(t)}
//                 >
//                   <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
//                     <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
//                       <div className="rounded bg-primary"></div>
//                       <div className="rounded bg-secondary"></div>
//                       <div className="rounded bg-accent"></div>
//                       <div className="rounded bg-neutral"></div>
//                     </div>
//                   </div>
//                   <span className="text-[11px] font-medium truncate w-full text-center">
//                     {t.charAt(0).toUpperCase() + t.slice(1)}
//                   </span>
//                 </button>
//               ))}
//             </div>

//             {/* Preview */}
//             <h3 className="text-lg font-semibold">Preview</h3>
//             <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg">
//               <div className="p-4 bg-base-200">
//                 <div className="max-w-lg mx-auto">
//                   <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
//                     <div className="px-4 py-3 border-b border-base-300 bg-base-100">
//                       <div className="flex items-center gap-3">
//                         <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
//                           J
//                         </div>
//                         <div>
//                           <h3 className="font-medium text-sm">John Doe</h3>
//                           <p className="text-xs text-base-content/70">Online</p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
//                       {PREVIEW_MESSAGES.map((message) => (
//                         <div key={message.id} className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}>
//                           <div className={`max-w-[80%] rounded-xl p-3 shadow-sm
//                             ${message.isSent ? "bg-primary text-primary-content" : "bg-base-200"}`}>
//                             <p className="text-sm">{message.content}</p>
//                             <p className={`text-[10px] mt-1.5
//                               ${message.isSent ? "text-primary-content/70" : "text-base-content/70"}`}>
//                               12:00 PM
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="p-4 border-t border-base-300 bg-base-100">
//                       <div className="flex gap-2">
//                         <input
//                           type="text"
//                           className="input input-bordered flex-1 text-sm h-10"
//                           placeholder="Type a message..."
//                           value="This is a preview"
//                           readOnly
//                         />
//                         <button className="btn btn-primary h-10 min-h-0">
//                           <Send size={18} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="h-screen pt-16 flex">
//       {/* Sidebar */}
//       <div className="w-64 border-r border-base-300 bg-base-100 flex flex-col">
//         <div className="p-4 border-b border-base-300">
//           <h1 className="text-xl font-bold">Settings</h1>
//         </div>
//         <nav className="flex-1 p-2 space-y-1">
//           {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
//             <button
//               key={id}
//               onClick={() => setActiveSection(id)}
//               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
//                 ${activeSection === id ? "bg-primary text-primary-content" : "hover:bg-base-200"}`}
//             >
//               <Icon size={18} />
//               <span className="font-medium">{label}</span>
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 overflow-y-auto p-8 max-w-2xl">
//         {renderSection()}
//       </div>
//     </div>
//   );
// };

// export default SettingsPage;
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { Send, User, Lock, Bell, Shield, Palette } from "lucide-react";
import { useState, useRef } from "react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SIDEBAR_ITEMS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Lock },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "theme", label: "Theme", icon: Palette },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { authUser, updateProfileInfo, updateAccount, updatePrivacy } = useAuthStore();
  const [activeSection, setActiveSection] = useState("profile");

  // Profile state
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [profilePic, setProfilePic] = useState(authUser?.profilePic || "");
  const fileInputRef = useRef(null);

  // Account state
  const [email, setEmail] = useState(authUser?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Privacy state
  const [lastSeen, setLastSeen] = useState(authUser?.lastSeenVisibility || "everyone");
  const [profilePhoto, setProfilePhoto] = useState(authUser?.profilePhotoVisibility || "everyone");

  // Notifications state
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [sounds, setSounds] = useState(true);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setProfilePic(reader.result);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Profile</h2>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-content text-3xl font-bold overflow-hidden cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                {profilePic ? (
                  <img src={profilePic} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageChange}
              />
              <button className="btn btn-sm btn-outline" onClick={() => fileInputRef.current.click()}>
                Change Photo
              </button>
            </div>

            {/* Name */}
            <div className="form-control gap-1">
              <label className="label-text font-medium">Full Name</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            {/* Bio */}
            <div className="form-control gap-1">
              <label className="label-text font-medium">Bio</label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
                rows={3}
              />
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={() => updateProfileInfo({ fullName: name, bio, profilePic })}
            >
              Save Changes
            </button>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Account</h2>

            <div className="form-control gap-1">
              <label className="label-text font-medium">Email Address</label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="divider">Change Password</div>

            <div className="form-control gap-1">
              <label className="label-text font-medium">Current Password</label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="form-control gap-1">
              <label className="label-text font-medium">New Password</label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={() => updateAccount({ email, currentPassword, newPassword })}
            >
              Update Account
            </button>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Privacy</h2>

            <div className="form-control gap-1">
              <label className="label-text font-medium">Last Seen</label>
              <select
                className="select select-bordered w-full"
                value={lastSeen}
                onChange={(e) => setLastSeen(e.target.value)}
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>

            <div className="form-control gap-1">
              <label className="label-text font-medium">Profile Photo</label>
              <select
                className="select select-bordered w-full"
                value={profilePhoto}
                onChange={(e) => setProfilePhoto(e.target.value)}
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={() => updatePrivacy({ lastSeenVisibility: lastSeen, profilePhotoVisibility: profilePhoto })}
            >
              Save Privacy Settings
            </button>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Notifications</h2>

            <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
              <div>
                <p className="font-medium">Message Alerts</p>
                <p className="text-sm text-base-content/70">Get notified for new messages</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={messageAlerts}
                onChange={(e) => setMessageAlerts(e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
              <div>
                <p className="font-medium">Notification Sounds</p>
                <p className="text-sm text-base-content/70">Play sound for new messages</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={sounds}
                onChange={(e) => setSounds(e.target.checked)}
              />
            </div>
          </div>
        );

      case "theme":
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Theme</h2>
            <p className="text-sm text-base-content/70">Choose a theme for your chat interface</p>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t}
                  className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                    ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}`}
                  onClick={() => setTheme(t)}
                >
                  <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                    <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                      <div className="rounded bg-primary"></div>
                      <div className="rounded bg-secondary"></div>
                      <div className="rounded bg-accent"></div>
                      <div className="rounded bg-neutral"></div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium truncate w-full text-center">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </span>
                </button>
              ))}
            </div>

            <h3 className="text-lg font-semibold">Preview</h3>
            <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg">
              <div className="p-4 bg-base-200">
                <div className="max-w-lg mx-auto">
                  <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-base-300 bg-base-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
                          J
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">John Doe</h3>
                          <p className="text-xs text-base-content/70">Online</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
                      {PREVIEW_MESSAGES.map((message) => (
                        <div key={message.id} className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-xl p-3 shadow-sm
                            ${message.isSent ? "bg-primary text-primary-content" : "bg-base-200"}`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-[10px] mt-1.5
                              ${message.isSent ? "text-primary-content/70" : "text-base-content/70"}`}>
                              12:00 PM
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-base-300 bg-base-100">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input input-bordered flex-1 text-sm h-10"
                          placeholder="Type a message..."
                          value="This is a preview"
                          readOnly
                        />
                        <button className="btn btn-primary h-10 min-h-0">
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen pt-16 flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-base-300 bg-base-100 flex flex-col">
        <div className="p-4 border-b border-base-300">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                ${activeSection === id ? "bg-primary text-primary-content" : "hover:bg-base-200"}`}
            >
              <Icon size={18} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-2xl">
        {renderSection()}
      </div>
    </div>
  );
};

export default SettingsPage;