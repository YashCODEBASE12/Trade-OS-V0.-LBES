let currentUserId = 'guest';

export const getUserId = (): string => currentUserId;

export const setUserId = (userId: string) => {
  currentUserId = userId;
};

export const clearUserId = () => {
  currentUserId = 'guest';
};
