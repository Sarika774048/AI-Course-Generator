import { UserInputContext } from '@/app/_context/UserInpnutContext'
import CategoryList from '@/app/_shared/CategoryList'
import Image from 'next/image'
import { useContext } from 'react'


const SelectCategory = () => {
  
  const {userCourseInput, setUserCourseInput} = useContext(UserInputContext);


  const handleCategoryChange = (category) => {
    setUserCourseInput( prev => ({
      ...prev,
      category: category
    }))
  }

  
  return (
    <div className='px-10 md:px-20 mb-5'>
      <h2 className='text-xl font-medium mb-10'>Select Course Category</h2>
    <div className='grid grid-cols-3 gap-10 px-10 md:px-20'>
      
      {CategoryList.map((item, index) => (
        <div key={index} className={`flex flex-col p-5 border items-center rounded-xl hover:border-fuchsia-800 hover:bg-blue-300 cursor-pointer ${userCourseInput?.category===item.name?'border-fuchsia-800 bg-blue-300' : 'border-gray-300 bg-white'}`}
        onClick={ () => handleCategoryChange(item.name)}>
          <Image src={item.icon} alt={item.name} width={50} height={50} />
          <h2>{item.name}</h2>
        </div>
      ))}
    </div>
    </div>
  )
}

export default SelectCategory