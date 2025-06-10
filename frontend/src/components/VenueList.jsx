import React, { useEffect, useState } from 'react';
import {jwtDecode} from "jwt-decode";
import styles from  './VenueList.module.css';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';


const VenueList = () => {
    const [venues, setVenues] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [typeFilter, setTypeFilter] = useState('');
    const [showMenu, setShowMenu] = useState(false);

    // Авторизація
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [view, setView] = useState('login');
    const [showAuthForm, setShowAuthForm] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);


    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ name: "" ,email: "", password: "", confirmPassword: "" });

    // Адмін
    const [isAdmin, setIsAdmin] = useState(false);

    // Адмінський функціонал
    const [editingVenue, setEditingVenue] = useState(null);
    const [formData, setFormData] = useState({ name: '', location: '', type: '' });

    // Бронювання
    const [bookingVenue, setBookingVenue] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Переключення між переглядом майданчиків та профілем
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        fetch('/api/venue/get_all')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setVenues(data);
                setFiltered(data);
            })
            .catch(err => console.error('Error fetching venues:', err));
    }, []);

    useEffect(() => {
        if (isUserLoggedIn && bookingVenue) {
            fetchSlots(bookingVenue.id);
        }
    }, [isUserLoggedIn, bookingVenue]);


    const uniqueTypes = [...new Set(venues.map(v => v.type))];

    const handleTypeSelect = (type) => {
        setTypeFilter(type);
        setShowMenu(false);
        if (type === '') {
            setFiltered(venues);
        } else {
            setFiltered(venues.filter(v => v.type.toLowerCase().includes(type.toLowerCase())));
        }
    };

    // --- Обробники авторизації ---
    const handleLoginChange = (e) => {
        setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = (e) => {
        e.preventDefault();
        fetch('/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        })
            .then(res => {
                if (!res.ok) throw new Error(`Login failed: ${res.status}`);
                return res.json();
            })
            .then(data => {
                const token = data.token;
                localStorage.setItem('token', token);

                return fetch('/api/user/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

            })
            .then(res => res.json())
            .then(user => {
                console.log(user);
                if (user.role !== 'user') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
                setIsUserLoggedIn(true);
                setView('venues');
                setShowAuthForm(false);
            })
            .catch(err => alert('Помилка входу: ' + err.message));


    };

    // --- Реєстрація ---
    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = (e) => {
        e.preventDefault();

        if (registerData.password !== registerData.confirmPassword) {
            alert("Паролі не співпадають!");
            return;
        }
            fetch('api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: registerData.name,
                    email: registerData.email,
                    password: registerData.password,
                }),
            }) .then(res => {
                if (!res.ok) throw new Error(`Register failed: ${res.status}`);
                return res.json();
            });

            alert("Реєстрація успішна! Можна увійти.");
            setIsLoginMode(true);
            setShowAuthForm(true);
            setRegisterData({ name: "", email: "" , password: "", confirmPassword: "" });

    };


    // --- Вихід ---
    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsUserLoggedIn(false);
        setIsAdmin(false);
        setBookingVenue(null);
        setSlots([]);
        setSelectedSlot(null);
        setShowProfile(false);
    };

    // --- Завантаження слотів ---
    const fetchSlots = (venueId) => {
        const token = localStorage.getItem('token');
        fetch(`/api/venue/find_by_id/${venueId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                if (!res.ok) throw new Error('Не вдалося завантажити слоти');
                return res.json();
            })
            .then(data => setSlots(data))
            .catch(err => alert(err.message));
    };

    // --- Клік по бронюванню ---
    const handleBookingClick = (venue) => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Будь ласка, увійдіть в акаунт');
            setShowAuthForm(true);
            setBookingVenue(venue);
            return;
        }

        setBookingVenue(venue);
        fetchSlots(venue.id);
    };

    // --- Підтвердження бронювання ---
    const handleConfirmBooking = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Спочатку увійдіть в систему');
            return;
        }

        const dec = jwtDecode(token);
        const Userid = dec.id;

        fetch(`/api/bookings/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id: Userid,
                venue_id: bookingVenue.id,
                slot_id: selectedSlot.id,
                start_time: selectedSlot.start_time,
                end_time: selectedSlot.end_time,
                status: 'booked',
            }),
        })
            .then(async res => {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Status ${res.status}: ${errorText}`);
                }
                return res.json();
            })
            .then(() => {
                alert('Бронювання успішне!');
                setBookingVenue(null);
                setSlots([]);
                setSelectedSlot(null);
            })
            .catch(err => alert(`Не вдалося створити бронювання: ${err.message}`));
    };

    // --- Адмінський функціонал ---
    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditClick = (venue) => {
        setEditingVenue(venue);
        setFormData({
            name: venue.name,
            location: venue.location,
            type: venue.type,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        fetch(`/api/venue/update/${editingVenue.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        })
            .then(res => {
                if (!res.ok) throw new Error(`Update failed with status ${res.status}`);
                return res.json();
            })
            .then(updated => {
                const updatedList = venues.map(v => (v.id === updated.id ? updated : v));
                setVenues(updatedList);
                setFiltered(updatedList);
                setEditingVenue(null);
            })
            .catch(err => console.error('Update failed:', err));
    };

    const handleAdd = () => {
        const token = localStorage.getItem('token');

        fetch('/api/venue/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        })
            .then(res => {
                if (!res.ok) throw new Error(`Create failed with status ${res.status}`);
                return res.json();
            })
            .then(newVenue => {
                const updatedList = [...venues, newVenue];
                setVenues(updatedList);
                setFiltered(updatedList);
                setFormData({ name: '', location: '', type: '' });
            })
            .catch(err => console.error('Create failed:', err));
    };

    const handleDelete = (venueId) => {
        const token = localStorage.getItem('token');

        fetch(`/api/venue/delete/${venueId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                if (!res.ok) throw new Error(`Delete failed with status ${res.status}`);
                setVenues(venues.filter(v => v.id !== venueId));
                setFiltered(filtered.filter(v => v.id !== venueId));
            })
            .catch(err => console.error('Delete failed:', err));
    };


    return (
        <div className={styles.container}>

            {/* Кнопки входу/реєстрації та профілю */}
            <div
                className={styles.authHeader}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                }}
            >
                {isUserLoggedIn ? (
                    <button onClick={handleLogout}>
                        Вийти
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => {
                                setShowAuthForm(prev => !prev);
                                setIsLoginMode(true);
                            }}
                        >
                            {showAuthForm ? 'Скасувати' : 'Увійти'}
                        </button>

                        <button
                            onClick={() => {
                                setShowAuthForm(true);
                                setIsLoginMode(false);
                            }}
                            className={styles.registerButton}
                        >
                            Зареєструватись
                        </button>
                    </>
                )}
            </div>



            {/* Форма авторизації */}
            {showAuthForm && !isUserLoggedIn && isLoginMode && (
                <form className={styles.form} onSubmit={handleLogin}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                        className={styles.input}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        className={styles.input}
                    />
                    <button type="submit" className={styles.saveButton}>Увійти</button>
                </form>
            )}

            {showAuthForm && !isUserLoggedIn && !isLoginMode && (
                <form className={styles.input} onSubmit={handleRegister}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        required
                        className={styles.input}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                        className={styles.input}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                        className={styles.input}
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Підтвердження пароля"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        required
                        className={styles.input}
                    />
                    <button type="submit" className={styles.saveButton}>
                        Зареєструватися
                    </button>
                </form>
            )}
            {/* Якщо показуємо профіль, приховуємо майданчики */}
            {showProfile ? (
                <div className={styles.profileView}>
                    <h2>Профіль користувача</h2>
                    {/* Тут можна додати інформацію профілю */}
                    <button onClick={() => setShowProfile(false)} className={styles.backButton}>Назад до майданчиків</button>
                </div>
            ) : (
                <>
                    {/* Заголовок та фільтр */}
                    <div className={styles.headerRow}>
                        <h2 className={styles.header}>Майданчики</h2>
                    </div>

                    <div className={styles.dropdownWrapper}>
                        <button className={styles.dropdownButton} onClick={() => setShowMenu(prev => !prev)}>
                            {typeFilter ? `Фільтр: ${typeFilter}` : 'Фільтр за типом'} ⌄
                        </button>
                        {showMenu && (
                            <ul className={styles.dropdownMenu}>
                                {uniqueTypes.map(type => (
                                    <li key={type} onClick={() => handleTypeSelect(type)}>{type}</li>
                                ))}
                                <li onClick={() => handleTypeSelect('')}>Очистити фільтр</li>
                            </ul>
                        )}
                    </div>

                    {/* Список майданчиків */}
                    <ul className={styles.venueList}>
                        {filtered.map(venue => (
                            <li key={venue.id} className={styles.venueItem}>
                                <div>
                                    <h3>{venue.name}</h3>
                                    <p>{venue.location}</p>
                                    <p><i>{venue.type}</i></p>
                                </div>
                                <div>
                                    {!isAdmin && (
                                        <button onClick={() => handleBookingClick(venue)} className={styles.bookButton}>
                                            Забронювати
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <>
                                            <button onClick={() => handleEditClick(venue)} className={styles.editButton}>
                                                Редагувати
                                            </button>
                                            <button onClick={() => handleDelete(venue.id)} className={styles.deleteButton}>
                                                Видалити
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Адмінська форма редагування */}
                    {isAdmin && editingVenue && (
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <input
                                name="name"
                                placeholder="Назва"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                            <input
                                name="location"
                                placeholder="Адреса"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                            <input
                                name="type"
                                placeholder="Тип"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className={styles.input}
                            />
                            <button type="submit" className={styles.saveButton}>Зберегти</button>
                            <button onClick={() => setEditingVenue(null)} className={styles.cancelButton} type="button">Скасувати</button>
                        </form>
                    )}

                    {/* Адмінська форма додавання нового майданчика */}
                    {isAdmin && !editingVenue && (
                        <div className={styles.addVenueForm}>
                            <h3>Додати новий майданчик</h3>
                            <input
                                name="name"
                                placeholder="Назва"
                                value={formData.name}
                                onChange={handleChange}
                                className={styles.input}
                            />
                            <input
                                name="location"
                                placeholder="Адреса"
                                value={formData.location}
                                onChange={handleChange}
                                className={styles.input}
                            />
                            <input
                                name="type"
                                placeholder="Тип"
                                value={formData.type}
                                onChange={handleChange}
                                className={styles.input}
                            />
                            <button onClick={handleAdd} className={styles.addButton}>Додати</button>
                        </div>
                    )}

                    {/* Список слотів для бронювання */}
                    {bookingVenue && (
                        <div className={styles.bookingSection}>
                            <h3>Обрати слот для: {bookingVenue.name}</h3>
                            <ul>
                                {slots.filter(slot => slot.is_available).map(slot => (
                                    <li key={slot.id}>
                                        <label className={styles.slotLabel}>
                                            <input
                                                type="radio"
                                                name="slot"
                                                value={slot.id}
                                                onChange={() => setSelectedSlot(slot)}
                                            />
                                            <span>
                                                    {format(new Date(slot.start_time), 'd MMMM, HH:mm', { locale: uk })} — {format(new Date(slot.end_time), 'HH:mm', { locale: uk })}
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={handleConfirmBooking}
                                disabled={!selectedSlot}
                                className={styles.confirmButton}
                            >
                                Підтвердити бронювання
                            </button>
                            <button
                                onClick={() => {
                                    setBookingVenue(null);
                                    setSlots([]);
                                }}
                                className={styles.cancelButton}
                            >
                                Скасувати
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );

};

export default VenueList;
