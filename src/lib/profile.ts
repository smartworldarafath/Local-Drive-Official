export const PROFILE_UPDATED_EVENT = "localDriveProfileUpdated";

export const normalizeProfilePhone = (phone?: string | number | null) => {
  if (phone === undefined || phone === null) return "";
  const normalized = String(phone).trim().replace(/[^\d+]/g, "");
  return normalized.startsWith("+") ? normalized : normalized ? `+${normalized}` : "";
};

export const getActiveProfilePhone = (tgUser?: any | null) => {
  const userPhone = normalizeProfilePhone(tgUser?.phone);
  if (userPhone) return userPhone;

  const storedPhone = normalizeProfilePhone(localStorage.getItem("tgLoginPhone"));
  if (storedPhone) return storedPhone;

  return normalizeProfilePhone(localStorage.getItem("tgPhone"));
};

export const getProfileNameKey = (phone: string) =>
  `localDriveProfileName:${normalizeProfilePhone(phone)}`;

export const getProfileName = (phone: string) => {
  const normalizedPhone = normalizeProfilePhone(phone);
  if (!normalizedPhone) return "";
  return localStorage.getItem(getProfileNameKey(normalizedPhone)) || "";
};

export const saveProfileName = (phone: string, name: string) => {
  const normalizedPhone = normalizeProfilePhone(phone);
  const trimmedName = name.trim();
  if (!normalizedPhone || !trimmedName) return;
  localStorage.setItem(getProfileNameKey(normalizedPhone), trimmedName);
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
};
