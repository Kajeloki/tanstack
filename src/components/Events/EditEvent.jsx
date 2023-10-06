import { Link, redirect, useNavigate, useParams, useSubmit } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const submit = useSubmit();
  const navigate = useNavigate();
  const params = useParams();
  // const {mutate}=useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async(data)=>{
  //     const newEvent = data.event;
  //     await queryClient.cancelQueries({queryKey: ['events', params.id]});
  //     const previousEvent = queryClient.getQueryData(['events', params.id]);
  //     queryClient.setQueryData(['events', params.id], newEvent);
  //     return {previousEvent}
  //   },
  //   onError: (error,data, context)=>{
  //     queryClient.setQueryData(['events', params.id], context.previousEvent);
  //   },
  //   onSettled: ()=>{
  //       queryClient.invalidateQueries(['events', params.id])
  //   }
  // })
  const {data, isError, error}=useQuery({
    queryKey: ['events', params.id],
    queryFn: ({signal})=>fetchEvent({signal, id: params.id})
  })

  function handleSubmit(formData) {
    // mutate({id: params.id, event: formData});
    // navigate('../');
    submit(formData, {method: 'PUT'});
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  

  if(isError){
    content=(
    <>
      <ErrorBlock title='Failed to load event' message={error.info?.message || 'Please check your inputs and try again later'}/>
      <div className='form-actions'>
        <Link to="../" className="button">Okay</Link>
      </div>
    </>);
  };

  if(data){
    content=<EventForm inputData={data} onSubmit={handleSubmit}>
    <Link to="../" className="button-text">
      Cancel
    </Link>
    <button type="submit" className="button">
      Update
    </button>
  </EventForm>;
  };

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}

export const loader = ({params})=>{
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({signal})=>fetchEvent({signal, id: params.id})
  });  
}

export const action = async({request, params})=>{
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({id: params.id, event: updatedEventData});
  queryClient.invalidateQueries(['events']);
  return redirect('../');
}
