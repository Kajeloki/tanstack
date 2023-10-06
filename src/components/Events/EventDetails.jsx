import { Link, Navigate, Outlet, redirect, useNavigate, useNavigation, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from './../UI/Modal.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const eventID = params.id;

  const handleStartDelete = () => {
    setIsDeleting(true);
  };
  const handleStopDelete = () => {
    setIsDeleting(false);
  };
  // console.log(eventID);
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  });

  const { mutate, isPending: isPendingDeletion, isError: isErrorDeleting, error: errorDeleting } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      });
      navigate('/events');

    }
  });

  const deleteHandler = () => {
    mutate({ id: eventID });
  }
  // console.log(data.title);

  let content;

  if (isPending) {
    // content = <div className='center'><LoadingIndicator /></div>;
  }

  if (isError) {
    content = <ErrorBlock title='There is problem with this page' message={error.info?.message || 'Try again later'} />
  }

  if (data) {
    const formDate = new Date(data.date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    content = <>
      {isDeleting && <Modal onClose={handleStopDelete}>
        <h2>Are you sure?</h2>
        <p>Do you really want to delete this event?</p>
        <div className='form-actions'>
          {isPendingDeletion && <p>Deleting, please wait...</p>}
          {!isPendingDeletion && <>
            <button onClick={handleStopDelete} className='button-text'>Cancel</button>
            <button onClick={deleteHandler} className='button'>Delete</button>
          </>}


        </div>
        {isErrorDeleting && <ErrorBlock title='Failed to delete event' message={errorDeleting.info?.message || 'Failed to delete event, please try later again'}/>}
      </Modal>}

 
      <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formDate}  {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>
    </>;
  }
  return    <>
  <Outlet />
  <Header>
    <Link to="/events" className="nav-item">
      View all Events
    </Link>
  </Header>
   {content}
  </> 
}
