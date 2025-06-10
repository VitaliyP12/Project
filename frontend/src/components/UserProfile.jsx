import React, { useEffect, useState } from 'react';
import styles from './UserProfile.module.css';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        fetch('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : Promise.reject('Не вдалося отримати профіль'))
            .then(user => {
                setUser(user);
                return fetch(`/api/bookings/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            })
            .then(res => res.ok ? res.json() : Promise.reject('Не вдалося отримати бронювання'))
            .then(setBookings)
            .catch(err => alert(err))
            .finally(() => setLoading(false));
    }, []);

    const cancelBooking = (bookingId) => {
        if (!window.confirm('Ви впевнені, що хочете скасувати це бронювання?')) return;

        const token = localStorage.getItem('token');
        fetch(`/api/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.ok ? res.json() : Promise.reject('Не вдалося скасувати бронювання'))
            .then(updated => {
                setBookings(prev => prev.map(b =>
                    b.id === bookingId ? { ...b, status: 'cancelled' } : b
                ));
            })
            .catch(err => alert(err));
    };

    if (loading) return <p className={styles.header}>Завантаження...</p>;
    if (!user) return <p className={styles.header}>Користувач не авторизований</p>;

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>Профіль користувача</h2>
            <p>Email: {user.email}</p>

            <h3 className={styles.header}>Історія бронювань</h3>
            {bookings.length === 0 ? (
                <p>У вас немає бронювань</p>
            ) : (
                <ul className={styles.bookingsList}>
                    {bookings.map(booking => (
                        <li key={booking.id} className={styles.bookingItem}>
                            <div className={styles.bookingInfo}>
                                <p><strong>Майданчик:</strong> {booking.venue?.name}</p>

                                <p>
                                    <strong>Слот:</strong>{' '}
                                    {format(new Date(booking.start_time), 'd MMMM yyyy, HH:mm', { locale: uk })}
                                    {' — '}
                                    {format(new Date(booking.end_time), 'HH:mm', { locale: uk })}
                                </p>
                                <p>
                                    <strong>Статус:</strong>{' '}
                                    <span className={
                                        booking.status === 'cancelled' ? styles.cancelled :
                                            booking.status === 'active' ? styles.active :
                                                styles.other
                                    }>
                                        {booking.status === 'cancelled' ? 'Скасовано' :
                                            booking.status === 'active' ? 'Активне' :
                                                booking.status}
                                    </span>
                                </p>
                            </div>
                            {booking.status === 'booked' && (
                                <button className={styles.cancelButton} onClick={() => cancelBooking(booking.id)}>
                                    Скасувати бронювання
                                </button>
                            )}

                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UserProfile;
