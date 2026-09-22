import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from './components/ui/Header';
import { DoctorDashboard } from './components/ui/DoctorDashboard';
import { Datenschutz } from './components/legal/Datenschutz';
import { Impressum } from './components/legal/Impressum';

interface Service {
  id: string;
  title: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  image: string;
  details: {
    process: string;
    effect: string;
    aftercare: string;
  };
}

interface Doctor {
  name: string;
  title: string;
  bio: string;
  image: string;
  experience: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  source: string;
  reply?: string | null;
  createdAt: string;
}

interface BookedInterval {
  startMins: number;
  endMins: number;
}

export function App() {
  const { t, i18n } = useTranslation();

  const DOCTOR: Doctor = {
    name: 'Dr. Feier',
    title: t('feature_1_title', 'Врач-косметолог Dr.Feier'),
    bio: t('feature_1_desc', 'Специалист экспертного класса с многолетним клиническим опытом.'),
    image: '/doctor.jpg',
    experience: t('doctor_experience', '12 лет опыта')
  };

  const SERVICES: Service[] = [
    {
      id: 'a1', 
      title: t('srv_a1_title', 'Лечение пигментации IPL Lumecca'), 
      category: t('cat_hardware', 'Аппаратная косметология лица'), 
      duration: 45, price: 220,
      description: t('srv_a1_desc', 'Эффективное удаление пигментных пятен и веснушек интенсивным импульсным светом.'),
      image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_a1_proc', 'Вспышки света избирательно разрушают избыточный меланин в клетках.'), 
        effect: t('srv_a1_eff', 'Абсолютно ровный тон кожи, исчезновение пигментации и сияние.'), 
        aftercare: t('srv_a1_care', 'Пигмент потемнеет и отшелушится за 5-7 дней. Обязателен SPF 50.') 
      }
    },
    {
      id: 'a2', 
      title: t('srv_a2_title', 'Удаление сосудов / розацеа IPL Lumecca'), 
      category: t('cat_hardware', 'Аппаратная косметология лица'), 
      duration: 45, price: 220,
      description: t('srv_a2_desc', 'Точечная коагуляция расширенных сосудов и лечение купероза.'),
      image: 'https://images.unsplash.com/photo-1512290900722-9a70f8a85f39?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_a2_proc', 'Световая энергия поглощается гемоглобином, "запаивая" поврежденные капилляры.'), 
        effect: t('srv_a2_eff', 'Снижение красноты, устранение сосудистых звездочек и розацеа.'), 
        aftercare: t('srv_a2_care', 'Избегать бани, сауны, горячих ванн и активного спорта 7 дней.') 
      }
    },
    {
      id: 'a3', 
      title: t('srv_a3_title', 'Лечение акне / постакне IPL Lumecca'), 
      category: t('cat_hardware', 'Аппаратная косметология лица'), 
      duration: 45, price: 220,
      description: t('srv_a3_desc', 'Снятие активных воспалений и бактериальной нагрузки с кожи.'),
      image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_a3_proc', 'IPL-излучение глубоко проникает в дерму и уничтожает пропионовые бактерии акне.'), 
        effect: t('srv_a3_eff', 'Быстрое уменьшение высыпаний, сужение пор и осветление пятен постакне.'), 
        aftercare: t('srv_a3_care', 'Использовать успокаивающие средства, исключить кислоты на 3 дня.') 
      }
    },
    {
      id: 'a4', 
      title: t('srv_a4_title', 'Микроигольчатый RF-лифтинг Morpheus 8'), 
      category: t('cat_hardware', 'Аппаратная косметология лица'), 
      duration: 60, price: 350,
      description: t('srv_a4_desc', 'Глубокое ремоделирование, уплотнение и подтяжка кожи лица.'),
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_a4_proc', 'Радиоволновое воздействие подается через золотые микроиглы строго на заданную глубину.'), 
        effect: t('srv_a4_eff', 'Сокращение кожного лоскута, сглаживание морщин и рубцов, мощный лифтинг.'), 
        aftercare: t('srv_a4_care', 'Отек и покраснение держатся 2-4 дня. Полный запрет на загар.') 
      }
    },
    {
      id: 'a5', 
      title: t('srv_a5_title', 'SMAS лифтинг лица Ultraformer MPT'), 
      category: t('cat_hardware', 'Аппаратная косметология лица'), 
      duration: 90, price: 600,
      description: t('srv_a5_desc', 'Безоперационная подтяжка лица на уровне мышечно-апоневротического слоя.'),
      image: 'https://images.unsplash.com/photo-1598440947619-2ce65f90ccc1?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_a5_proc', 'Сфокусированный ультразвук точечно нагревает связочный аппарат лица (SMAS), сокращая его.'), 
        effect: t('srv_a5_eff', 'Четкий овал лица, устранение второго подбородка и нависших век. Эффект нарастает 3 месяца.'), 
        aftercare: t('srv_a5_care', 'Не требует реабилитации. Возможна легкая болезненность при нажатии пару недель.') 
      }
    },
    {
      id: 'a6', 
      title: t('srv_a6_title', 'Лазерное удаление шрамов (рубцов)'), 
      category: t('cat_hardware', 'Аппаратная косметология лица'), 
      duration: 30, price: 150,
      description: t('srv_a6_desc', 'Фракционная лазерная шлифовка рубцовой ткани.'),
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_a6_proc', 'Лазер выпаривает микроучастки рубцовой ткани, стимулируя рост новых здоровых клеток.'), 
        effect: t('srv_a6_eff', 'Сглаживание рельефа, рубцы и растяжки становятся значительно менее заметными.'), 
        aftercare: t('srv_a6_care', 'Корочки держатся 5-7 дней. Строгий запрет на скрабы и пребывание на солнце.') 
      }
    },
    {
      id: 'a7', 
      title: t('srv_a7_title', 'Лазерная шлифовка лица и тела'), 
      category: t('cat_hardware', 'Аппаратная косметология лица'), 
      duration: 60, price: 400,
      description: t('srv_a7_desc', 'Тотальное обновление эпидермиса абляционным лазером.'),
      image: 'https://images.unsplash.com/photo-1554050857-c84a8abdb5e5?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_a7_proc', 'Контролируемое фракционное повреждение верхних слоев кожи для запуска тотальной регенерации.'), 
        effect: t('srv_a7_eff', 'Стирание мелких морщин, идеальный ровный рельеф, сужение пор и обновление тона.'), 
        aftercare: t('srv_a7_care', 'Реабилитация 7-10 дней (интенсивная краснота, корки, активное шелушение).') 
      }
    },
    {
      id: 'a8', 
      title: t('srv_a8_title', 'Эндосфера терапия, массаж лица'), 
      category: t('cat_hardware', 'Аппаратная косметология лица'), 
      duration: 45, price: 120,
      description: t('srv_a8_desc', 'Компрессионная микровибрация для тонуса мышц и лимфодренажа.'),
      image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_a8_proc', 'Аппаратный массаж манипулой с вращающимися силиконовыми сферами.'), 
        effect: t('srv_a8_eff', 'Снятие отеков, улучшение микроциркуляции, здоровый цвет лица и тонус мышц.'), 
        aftercare: t('srv_a8_care', 'Специальный уход не требуется. Можно сразу возвращаться к делам.') 
      }
    },
    {
      id: 'i1', 
      title: t('srv_i1_title', 'Контурная пластика'), 
      category: t('cat_injection', 'Инъекционная косметология'), 
      duration: 45, price: 300,
      description: t('srv_i1_desc', 'Коррекция объема губ, скул, профиля Джоли препаратами гиалуроновой кислоты.'),
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_i1_proc', 'Введение плотного геля-филлера с помощью тонкой иглы или атравматичной канюли.'), 
        effect: t('srv_i1_eff', 'Мгновенная гармонизация пропорций лица, восполнение утраченных объемов.'), 
        aftercare: t('srv_i1_care', 'Возможен отек и небольшие синяки до 5 дней. Запрещено массировать зоны инъекций.') 
      }
    },
    {
      id: 'i2', 
      title: t('srv_i2_title', 'Векторный лифтинг Radiesse'), 
      category: t('cat_injection', 'Инъекционная косметология'), 
      duration: 60, price: 450,
      description: t('srv_i2_desc', 'Биостимуляция коллагена препаратом на основе гидроксиапатита кальция.'),
      image: 'https://images.unsplash.com/photo-1508759073847-92cbba39cc49?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_i2_proc', 'Препарат вводится векторной техникой по линиям натяжения кожи для создания плотного каркаса.'), 
        effect: t('srv_i2_eff', 'Мощный лифтинг, уплотнение дряблой кожи без создания излишнего объема на лице.'), 
        aftercare: t('srv_i2_care', 'Исключить тепловые процедуры на 2 недели. Эффект нарастает в течение 2-3 месяцев.') 
      }
    },
    {
      id: 'i3', 
      title: t('srv_i3_title', 'Ботулинотерапия'), 
      category: t('cat_injection', 'Инъекционная косметология'), 
      duration: 30, price: 280,
      description: t('srv_i3_desc', 'Блокировка мимических мышц нейропротеином для устранения морщин.'),
      image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_i3_proc', 'Точечные микроуколы препарата в зоны активной мимики (лоб, межбровье, глаза).'), 
        effect: t('srv_i3_eff', 'Полное разглаживание мимических морщин, открытый взгляд, профилактика глубоких заломов.'), 
        aftercare: t('srv_i3_care', 'Не принимать горизонтальное положение 4 часа. Запрет на алкоголь и бани на 7 дней.') 
      }
    },
    {
      id: 'i4', 
      title: t('srv_i4_title', 'Биоревитализация'), 
      category: t('cat_injection', 'Инъекционная косметология'), 
      duration: 45, price: 200,
      description: t('srv_i4_desc', 'Глубокое увлажнение и восстановление кожи гиалуроновой кислотой.'),
      image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_i4_proc', 'Множественные поверхностные микроинъекции препарата по всей зоне лица, шеи или декольте.'), 
        effect: t('srv_i4_eff', 'Здоровое сияние, повышение плотности и тургора кожи, устранение сухости и мелких морщин.'), 
        aftercare: t('srv_i4_care', 'На коже остаются мелкие папулы (бугорки), которые самостоятельно рассасываются за 1-3 дня.') 
      }
    },
    {
      id: 'i5', 
      title: t('srv_i5_title', 'Мезотерапия'), 
      category: t('cat_injection', 'Инъекционная косметология'), 
      duration: 45, price: 180,
      description: t('srv_i5_desc', 'Введение индивидуальных витаминных и пептидных коктейлей по проблеме.'),
      image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_i5_proc', 'Инъекционное введение активных веществ в средние слои дермы.'), 
        effect: t('srv_i5_eff', 'Комплексное лечение акне, осветление пигментации, стимуляция роста волос.'), 
        aftercare: t('srv_i5_care', 'Легкое покраснение исчезает через несколько часов. Не использовать плотный макияж в первые сутки.') 
      }
    },
    {
      id: 'i6', 
      title: t('srv_i6_title', 'Ферментная липосакция'), 
      category: t('cat_injection', 'Инъекционная косметология'), 
      duration: 40, price: 200,
      description: t('srv_i6_desc', 'Точечное разрушение стойких жировых отложений ферментами.'),
      image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_i6_proc', 'Инъекции ферментного комплекса (липаза, коллагеназа, гиалуронидаза) в жировые ловушки.'), 
        effect: t('srv_i6_eff', 'Быстрое уменьшение объемов второго подбородка, брылей и компактизация лица.'), 
        aftercare: t('srv_i6_care', 'Возможен умеренный отек до 3-5 дней.') 
      }
    },
    {
      id: 'i7', 
      title: t('srv_i7_title', 'Липолитики'), 
      category: t('cat_injection', 'Инъекционная косметология'), 
      duration: 30, price: 150,
      description: t('srv_i7_desc', 'Классическое инъекционное расщепление локальных жировых отложений.'),
      image: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_i7_proc', 'Введение липолитического препарата глубоко в подкожно-жировую клетчатку.'), 
        effect: t('srv_i7_eff', 'Постепенное уменьшение объемов локальных жировых пакетов.'), 
        aftercare: t('srv_i7_care', 'Необходимо пить много чистой воды для вывода расщепленных жиров лимфатической системой.') 
      }
    },
    {
      id: 'i8', 
      title: t('srv_i8_title', 'Лечение гипергидроза'), 
      category: t('cat_injection', 'Инъекционная косметология'), 
      duration: 40, price: 350,
      description: t('srv_i8_desc', 'Устранение повышенной потливости подмышек, стоп или ладоней.'),
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_i8_proc', 'Множественные инъекции ботулотоксина в зону повышенного потоотделения.'), 
        effect: t('srv_i8_eff', 'Абсолютная сухость в обработанных зонах на срок от 6 до 9 месяцев.'), 
        aftercare: t('srv_i8_care', 'Исключить использование антиперспирантов в первые 24 часа.') 
      }
    },
    {
      id: 'i9', 
      title: t('srv_i9_title', 'Плазмолифтинг Endoret'), 
      category: t('cat_injection', 'Инъекционная косметология'), 
      duration: 60, price: 250,
      description: t('srv_i9_desc', 'Премиальное клеточное омоложение собственной обогащенной плазмой.'),
      image: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_i9_proc', 'Забор небольшого объема крови, центрифугирование и введение плазмы, богатой факторами роста.'), 
        effect: t('srv_i9_eff', 'Мощная регенерация, лечение акне и розацеа, повышение иммунитета и качества кожи.'), 
        aftercare: t('srv_i9_care', 'Минимальный отек. Высочайшая биосовместимость, риск аллергий равен нулю.') 
      }
    },
    {
      id: 'i10', 
      title: t('srv_i10_title', 'Плазмолифтинг'), 
      category: t('cat_injection', 'Инъекционная косметология'), 
      duration: 50, price: 180,
      description: t('srv_i10_desc', 'Классическая PRP-терапия для восстановления кожи.'),
      image: 'https://images.unsplash.com/photo-1509304673892-cb39371759ea?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_i10_proc', 'Введение собственной плазмы пациента в проблемные зоны лица или волосистой части головы.'), 
        effect: t('srv_i10_eff', 'Улучшение цвета лица, ускорение заживления после агрессивных процедур, остановка выпадения волос.'), 
        aftercare: t('srv_i10_care', 'Избегать тепловых процедур и декоративной косметики в первые сутки.') 
      }
    },
    {
      id: 'c1', 
      title: t('srv_c1_title', 'Вакуумный гидропилинг Aquapure'), 
      category: t('cat_face', 'Косметология лица'), 
      duration: 60, price: 150,
      description: t('srv_c1_desc', 'Аппаратное очищение, эксфолиация и глубокое увлажнение под вакуумом.'),
      image: 'https://images.unsplash.com/photo-1611077544390-111161d368e2?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_c1_proc', '4 этапа в одной процедуре: пилинг, вакуумная экстракция комедонов, электропорация и внедрение сывороток.'), 
        effect: t('srv_c1_eff', 'Идеально чистые поры, гладкость и сияние. Идеальная процедура "на выход".'), 
        aftercare: t('srv_c1_care', 'Абсолютно без реабилитации. Можно сразу наносить макияж.') 
      }
    },
    {
      id: 'c2', 
      title: t('srv_c2_title', 'Чистка лица'), 
      category: t('cat_face', 'Косметология лица'), 
      duration: 60, price: 95,
      description: t('srv_c2_desc', 'Классическая механическая или комбинированная чистка.'),
      image: 'https://images.unsplash.com/photo-1596755389378-f6ee35a1cbba?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_c2_proc', 'Размягчение рогового слоя, глубокое удаление закрытых и открытых комедонов, нанесение поросуживающей маски.'), 
        effect: t('srv_c2_eff', 'Ровный рельеф, здоровая кожа без черных точек и воспалительных элементов.'), 
        aftercare: t('srv_c2_care', 'Возможно локальное покраснение до 12 часов. Не умываться агрессивными средствами до вечера.') 
      }
    },
    {
      id: 'c3', 
      title: t('srv_c3_title', 'Пилинг лица'), 
      category: t('cat_face', 'Косметология лица'), 
      duration: 35, price: 130,
      description: t('srv_c3_desc', 'Химическое обновление эпидермиса (всесезонные и ретиноловые пилинги).'),
      image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_c3_proc', 'Нанесение специализированного кислотного состава подобранного по типу и проблематике кожи.'), 
        effect: t('srv_c3_eff', 'Сужение пор, осветление пигментации, выравнивание тона, легкий лифтинг-эффект.'), 
        aftercare: t('srv_c3_care', 'В зависимости от пилинга возможно шелушение на 3-5 день. Категорически обязателен крем с SPF.') 
      }
    },
    {
      id: 'c4', 
      title: t('srv_c4_title', 'Ферментотерапия DMK'), 
      category: t('cat_face', 'Косметология лица'), 
      duration: 90, price: 180,
      description: t('srv_c4_desc', 'Уникальная процедура восстановления кровообращения на клеточном уровне.'),
      image: 'https://images.unsplash.com/photo-1601612445100-33568c07d341?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_c4_proc', 'Нанесение комплекса энзимных масок, которые плотно застывают, создавая давление и пульсацию в сосудах.'), 
        effect: t('srv_c4_eff', 'Плазматический эффект (видимая сеть капилляров), мощный детокс, снятие отеков и глубокий лифтинг.'), 
        aftercare: t('srv_c4_care', 'Красные следы от активных капилляров исчезают самостоятельно через 20-30 минут.') 
      }
    },
    {
      id: 'c5', 
      title: t('srv_c5_title', 'Монодозные процедуры Casmara'), 
      category: t('cat_face', 'Косметология лица'), 
      duration: 60, price: 110,
      description: t('srv_c5_desc', 'Премиальный альгинатный уход для мгновенного преображения.'),
      image: 'https://images.unsplash.com/photo-1523624536767-f4e91bcbd493?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_c5_proc', 'Нанесение активных ампульных концентратов с последующим перекрытием плотной альгинатной маской.'), 
        effect: t('srv_c5_eff', 'Глубокое увлажнение, успокоение кожи, снятие следов усталости и стресса.'), 
        aftercare: t('srv_c5_care', 'Без реабилитации.') 
      }
    },
    {
      id: 'c6', 
      title: t('srv_c6_title', 'Атравматическая чистка лица'), 
      category: t('cat_face', 'Косметология лица'), 
      duration: 50, price: 90,
      description: t('srv_c6_desc', 'Деликатное очищение кожи без механического давления.'),
      image: 'https://images.unsplash.com/photo-1613038676662-8178a9c2a688?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_c6_proc', 'Использование фруктовых кислот и ферментов для растворения сальных пробок.'), 
        effect: t('srv_c6_eff', 'Свежая и чистая кожа без покраснений и травматизации.'), 
        aftercare: t('srv_c6_care', 'Идеально подходит для чувствительной кожи и кожи с куперозом.') 
      }
    },
    {
      id: 'c7', 
      title: t('srv_c7_title', 'Микротоковая терапия | Электропорация'), 
      category: t('cat_face', 'Косметология лица'), 
      duration: 45, price: 80,
      description: t('srv_c7_desc', 'Безынъекционное введение сывороток и клеточный микромассаж.'),
      image: 'https://images.unsplash.com/photo-1551609121-6b4d3e8e24c6?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_c7_proc', 'Воздействие слабыми импульсными токами для стимуляции мышц и проведения полезных веществ вглубь кожи.'), 
        effect: t('srv_c7_eff', 'Снятие мышечного спазма, уменьшение отечности, восстановление тонуса.'), 
        aftercare: t('srv_c7_care', 'Курсовая процедура, не требующая восстановления.') 
      }
    },
    {
      id: 'c8', 
      title: t('srv_c8_title', 'Ультразвуковая чистка лица'), 
      category: t('cat_face', 'Косметология лица'), 
      duration: 40, price: 70,
      description: t('srv_c8_desc', 'Поверхностный аппаратный пилинг ультразвуковой лопаткой.'),
      image: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&w=600&q=80',
      details: { 
        process: t('srv_c8_proc', 'Ультразвуковая волна "выбивает" загрязнения из пор и снимает ороговевший слой.'), 
        effect: t('srv_c8_eff', 'Обновление эпидермиса, легкое осветление и улучшение проникновения домашнего ухода.'), 
        aftercare: t('srv_c8_care', 'Легкая гиперемия (покраснение) проходит за час.') 
      }
    }
  ];

  const TIME_SLOTS = [
    '10:00', '10:45', '11:30', '12:15', '13:00', '13:45',
    '14:30', '15:15', '16:00', '16:45', '17:30', '18:15', '19:00'
  ];

  const CATEGORIES = [
    t('cat_face', 'Косметология лица'), 
    t('cat_injection', 'Инъекционная косметология'), 
    t('cat_hardware', 'Аппаратная косметология лица')
  ];

  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'doctors' | 'booking' | 'reviews' | 'contacts' | 'impressum' | 'datenschutz' | 'admin'>('home');
  
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [bookedIntervals, setBookedIntervals] = useState<BookedInterval[]>([]);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [serviceDetailsModal, setServiceDetailsModal] = useState<Service | null>(null);
  
  const [showCookies, setShowCookies] = useState<boolean>(() => {
    return !localStorage.getItem('cookie_consent');
  });

  const [publicReviews, setPublicReviews] = useState<Review[]>([]);
  const [clientReview, setClientReview] = useState({ author: '', rating: 5, text: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleCookieAction = (type: 'all' | 'essential') => {
    localStorage.setItem('cookie_consent', type);
    setShowCookies(false);
  };

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchPublicReviews();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedDate && activeTab === 'booking') {
      const fetchBookedSlots = async () => {
        try {
          const res = await fetch(`http://127.0.0.1:5000/api/appointments/booked?date=${selectedDate}`);
          const data = await res.json();
          if (data.success) {
            const intervals = data.bookedAppointments.map((app: any) => {
              const [h, m] = app.time.split(':').map(Number);
              const startMins = h * 60 + m;
              
              let duration = 0;
              const names = app.service ? app.service.split(' + ').map((s: string) => s.trim()) : [];
              names.forEach((name: string) => {
                const s = SERVICES.find(x => x.title === name);
                if (s) duration += s.duration;
              });
              if (duration === 0) duration = 45; 
              
              return { startMins, endMins: startMins + duration };
            });
            setBookedIntervals(intervals);
          }
        } catch (err) {
          console.error('Ошибка загрузки занятых слотов:', err);
        }
      };
      fetchBookedSlots();
    }
  }, [selectedDate, activeTab]);

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  useEffect(() => {
    if (selectedTime) {
      const [h, m] = selectedTime.split(':').map(Number);
      const slotStart = h * 60 + m;
      const currentDur = totalDuration > 0 ? totalDuration : 1;
      const slotEnd = slotStart + currentDur;
      
      const isInvalid = bookedIntervals.some(interval => 
        Math.max(slotStart, interval.startMins) < Math.min(slotEnd, interval.endMins)
      );
      
      if (isInvalid) {
        setSelectedTime('');
      }
    }
  }, [totalDuration, bookedIntervals, selectedTime]);

  const fetchPublicReviews = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/reviews');
      const data = await res.json();
      if (data.success) {
        setPublicReviews(data.reviews);
      }
    } catch (err) {
      console.error('Ошибка загрузки отзывов:', err);
    }
  };

  const handleClientReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientReview.author || !clientReview.text) return;
    try {
      const res = await fetch('http://127.0.0.1:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clientReview, source: 'SITE' })
      });
      if (res.ok) {
        setClientReview({ author: '', rating: 5, text: '' });
        setReviewSubmitted(true);
        fetchPublicReviews();
        setTimeout(() => setReviewSubmitted(false), 4000);
      }
    } catch (err) {
      alert('Ошибка соединения с сервером');
    }
  };

  const toggleServiceSelection = (service: Service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  useEffect(() => {
    const getSeoData = () => {
      switch (activeTab) {
        case 'services': return { title: t('seo_title_services', 'Услуги и цены | Dr. Feier CLINIC'), desc: t('seo_desc_services', 'Полный спектр инъекционных и аппаратных процедур.') };
        case 'doctors': return { title: t('seo_title_doctors', 'Врач-косметолог Dr. Feier'), desc: t('seo_desc_doctors', 'Специалист с многолетним клиническим опытом.') };
        case 'booking': return { title: t('seo_title_booking', 'Онлайн-запись | Dr. Feier CLINIC'), desc: t('seo_desc_booking', 'Быстрая онлайн-запись на премиальные процедуры без очередей.') };
        case 'reviews': return { title: t('seo_title_reviews', 'Отзывы пациентов | Dr. Feier CLINIC'), desc: t('seo_desc_reviews', 'Истории преображения и реальные отзывы наших клиентов.') };
        case 'contacts': return { title: t('seo_title_contacts', 'Контакты клиники | Dr. Feier CLINIC'), desc: t('seo_desc_contacts', 'Свяжитесь с нами для консультации и записи.') };
        case 'admin': return { title: 'Панель управления | Dr. Feier', desc: '' };
        default: return { title: t('seo_title_home', 'Медицинская клиника Dr. Feier | Премиум эстетика'), desc: t('seo_desc_home', 'Инновационные аппаратные методики и экспертная дерматология.') };
      }
    };
    const { title, desc } = getSeoData();
    document.title = title;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', desc);
  }, [activeTab, i18n.language, t]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) return alert(t('alert_no_service', 'Пожалуйста, выберите минимум одну процедуру.'));
    if (!firstName || !lastName || !email || !phone || !selectedTime || !selectedDate) {
      alert(t('alert_fill_fields', 'Пожалуйста, заполните все обязательные поля формы.'));
      return;
    }

    const combinedServicesNames = selectedServices.map(s => s.title).join(' + ');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName, lastName, email, phone, 
          service: combinedServicesNames, 
          date: selectedDate, 
          time: selectedTime 
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setShowModal(true);
        setSelectedServices([]);
        setFirstName(''); setLastName(''); setEmail(''); setPhone(''); 
        
        const [h, m] = selectedTime.split(':').map(Number);
        const startMins = h * 60 + m;
        const currentDur = totalDuration > 0 ? totalDuration : 45;
        setBookedIntervals(prev => [...prev, { startMins, endMins: startMins + currentDur }]);
        setSelectedTime('');

      } else {
        alert(data.error || t('alert_error', 'Ошибка при создании записи.'));
      }
    } catch (err) {
      alert(t('alert_network_error', 'Ошибка соединения с сервером.'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-amber-200 selection:text-slate-900 font-sans relative overflow-x-hidden">
      
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-amber-300/30 via-rose-200/30 to-transparent blur-[120px] transition-transform duration-700 ease-out animate-pulse" style={{ transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)` }} />
        <div className="absolute top-[40%] -right-[15%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-bl from-indigo-200/20 via-amber-200/30 to-transparent blur-[140px] transition-transform duration-700 ease-out" style={{ transform: `translate(${-mousePos.x * 2}px, ${-mousePos.y * 2}px)` }} />
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      {/* Подключенный адаптивный компонент шапки */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 py-12 w-full flex-grow relative z-10">
        
        {activeTab === 'admin' && (
          <DoctorDashboard />
        )}

        {activeTab === 'home' && (
          <div className="flex flex-col gap-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 flex flex-col gap-6">
                <span className="inline-block bg-amber-50 text-amber-600 text-[10px] sm:text-xs font-bold px-3 py-2 rounded-xl border border-amber-200 uppercase tracking-wider text-center leading-relaxed">
                  {t('hero_badge', 'Премиальная эстетическая медицина')}
                </span>
                <h1 className="text-4xl sm:text-6xl font-serif tracking-tight text-slate-900 leading-tight">
                  {t('hero_title_1', 'Искусство вашей')} <br />
                  <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">{t('hero_title_2', 'естественной красоты')}</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-medium">
                  {t('hero_description', 'Инновационные аппаратные методики, экспертная дерматология и безопасные инъекционные протоколы в самом сердце столицы.')}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <button 
                    onClick={() => setActiveTab('booking')}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-amber-500/30 hover:-translate-y-1 transition-all uppercase text-xs tracking-wider"
                  >
                    {t('btn_book_action', 'Записаться на процедуру')}
                  </button>
                  <button 
                    onClick={() => setActiveTab('services')}
                    className="px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-2xl transition-all uppercase text-xs tracking-wider shadow-sm"
                  >
                    {t('btn_view_services', 'Смотреть услуги')}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 relative">
                <div className="relative h-[450px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/50 group bg-white border border-slate-100">
                  <img 
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80" 
                    alt="Clinic" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 flex items-center justify-between shadow-lg">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">{t('hero_card_badge', 'Стандарт качества')}</span>
                      <h4 className="font-serif text-sm text-slate-900 font-semibold">{t('hero_card_text', 'Сертифицированное оборудование США и Европы')}</h4>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold border border-amber-100">✓</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div onClick={() => setActiveTab('doctors')} className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl p-8 hover:border-amber-300 hover:shadow-amber-100 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold mb-6 text-xl">01</div>
                <h3 className="font-serif text-lg text-slate-900 mb-2 group-hover:text-amber-600 transition-colors font-semibold">{t('feature_1_title', 'Врач-косметолог Dr.Feier')}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{t('feature_1_desc', 'Специалист с многолетним клиническим опытом, регулярным международным обучением и экспертным подходом.')}</p>
              </div>
              <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl p-8 hover:border-amber-300 hover:shadow-amber-100 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold mb-6 text-xl">02</div>
                <h3 className="font-serif text-lg text-slate-900 mb-2 font-semibold">{t('feature_2_title', 'Премиум препараты')}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{t('feature_2_desc', 'Используем исключительно сертифицированные оригинальные препараты и материалы с доказанной эффективностью и безопасностью.')}</p>
              </div>
              <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl p-8 hover:border-amber-300 hover:shadow-amber-100 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold mb-6 text-xl">03</div>
                <h3 className="font-serif text-lg text-slate-900 mb-2 font-semibold">{t('feature_3_title', 'Безупречный сервис')}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{t('feature_3_desc', 'Полная конфиденциальность, забота о каждом клиенте, уютная атмосфера и абсолютный комфорт во время визита.')}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="flex flex-col gap-12 animate-fade-in max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">{t('services_badge', 'Наши процедуры')}</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 mt-4 mb-4 font-semibold">{t('services_title', 'Полный спектр услуг')}</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">{t('services_subtitle', 'Кликните на процедуру для детального ознакомления и онлайн-записи.')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 items-start text-left bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              {CATEGORIES.map(cat => (
                <div key={cat} className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="h-0.5 w-6 bg-amber-400 shrink-0"></div>
                    <h3 className="font-serif text-lg font-bold text-slate-600 leading-snug">{cat}</h3>
                  </div>
                  <ul className="flex flex-col gap-4">
                    {SERVICES.filter(s => s.category === cat).map(service => (
                      <li 
                        key={service.id} 
                        onClick={() => setServiceDetailsModal(service)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full border border-cyan-400 group-hover:bg-cyan-400 transition-colors shrink-0"></span>
                        <span className="text-slate-700 text-sm font-medium group-hover:text-amber-600 transition-colors leading-snug">
                          {service.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {serviceDetailsModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
              <div className="relative h-64 shrink-0">
                <img src={serviceDetailsModal.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <button onClick={() => setServiceDetailsModal(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full text-white font-bold transition-colors">✕</button>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block shadow-sm">
                    {serviceDetailsModal.category}
                  </span>
                  <h2 className="font-serif text-3xl text-white font-semibold leading-tight">{serviceDetailsModal.title}</h2>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto flex flex-col gap-6 bg-slate-50">
                <div>
                  <h4 className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-2">{t('modal_desc_label', 'Описание')}</h4>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">{serviceDetailsModal.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs uppercase text-amber-600 font-bold tracking-wider mb-2 flex items-center gap-2">⚙️ {t('modal_process_label', 'Как проходит')}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed font-medium">{serviceDetailsModal.details.process}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs uppercase text-emerald-600 font-bold tracking-wider mb-2 flex items-center gap-2">✨ {t('modal_effect_label', 'Эффект')}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed font-medium">{serviceDetailsModal.details.effect}</p>
                  </div>
                </div>
                
                <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
                  <h4 className="text-xs uppercase text-rose-600 font-bold tracking-wider mb-2 flex items-center gap-2">⚠️ {t('modal_aftercare_label', 'Реабилитация и уход')}</h4>
                  <p className="text-rose-800 text-xs leading-relaxed font-medium">{serviceDetailsModal.details.aftercare}</p>
                </div>
              </div>
              
              <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{serviceDetailsModal.price} <span className="text-amber-500">€</span></div>
                  <div className="text-xs text-slate-500 font-medium tracking-wider uppercase mt-1">{t('modal_duration_label', 'Длительность:')} {serviceDetailsModal.duration} {t('booking_min', 'мин')}</div>
                </div>
                <button 
                  onClick={() => { 
                    setServiceDetailsModal(null); 
                    setActiveTab('booking');
                    if (!selectedServices.find(s => s.id === serviceDetailsModal.id)) {
                      setSelectedServices([...selectedServices, serviceDetailsModal]);
                    }
                  }} 
                  className="px-8 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-amber-500 hover:to-rose-500 text-white font-bold rounded-xl uppercase text-xs tracking-wider transition-all shadow-lg"
                >
                  {t('modal_book', 'Записаться')}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="flex flex-col gap-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">{t('doctor_badge', 'Наш специалист')}</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 mt-4 mb-4 font-semibold">{t('doctor_title', 'Врач косметолог Dr.Feier')}</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">{t('doctor_subtitle', 'Профессионал высшей категории, которому доверяют вашу молодость и здоровье.')}</p>
            </div>

            <div className="max-w-xl mx-auto w-full">
              <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden flex flex-col">
                <div className="h-80 overflow-hidden relative bg-slate-50 flex items-center justify-center">
                  <img src={DOCTOR.image} alt={DOCTOR.name} className="w-full h-full object-contain" />
                  <div className="absolute bottom-3 right-3 bg-amber-500 text-white font-bold text-xs px-3 py-1 rounded-xl shadow-lg">
                    {DOCTOR.experience}
                  </div>
                </div>
                <div className="p-8 flex flex-col gap-4">
                  <h3 className="font-serif text-2xl text-slate-900 font-semibold">{DOCTOR.name}</h3>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{DOCTOR.title}</span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{DOCTOR.bio}</p>
                  <button onClick={() => setActiveTab('booking')} className="mt-4 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-opacity shadow-lg shadow-amber-500/20">
                    {t('btn_book_doctor', 'Записаться к врачу')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-12 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">{t('reviews_badge', 'Истории преображения')}</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 mt-4 mb-4 font-semibold">{t('reviews_title', 'Отзывы пациентов')}</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">{t('reviews_subtitle', 'Что говорят наши гости после посещения клиники.')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicReviews.length > 0 ? publicReviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl p-6 flex flex-col group hover:border-amber-200 transition-colors">
                  <div className="text-amber-400 mb-3 text-lg">{'★'.repeat(rev.rating)}</div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium mb-6 italic">"{rev.text}"</p>
                  
                  <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between text-xs mb-3">
                    <span className="font-serif text-slate-900 font-bold text-base">{rev.author}</span>
                    <span className="text-slate-400 font-mono">{new Date(rev.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>

                  {rev.reply && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 mt-2">
                      <span className="font-bold text-amber-600 block mb-1 uppercase tracking-wider text-[10px]">Ответ клиники:</span>
                      {rev.reply}
                    </div>
                  )}
                </div>
              )) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-slate-400 py-12 font-medium bg-slate-50 border border-slate-200 border-dashed rounded-3xl">
                  {t('no_reviews', 'Отзывов пока нет. Поделитесь своим опытом первым!')}
                </div>
              )}
            </div>

            <div className="max-w-md mx-auto w-full bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl p-6 mt-4">
              <h3 className="font-serif text-xl text-slate-900 mb-4 font-semibold text-center">{t('leave_review_title', 'Оставьте свой отзыв')}</h3>
              
              {reviewSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl text-center font-bold text-xs shadow-inner">
                  {t('review_success', 'Спасибо! Отзыв отправлен на проверку.')}
                </div>
              ) : (
                <form onSubmit={handleClientReviewSubmit} className="flex flex-col gap-3">
                  <input 
                    type="text" required placeholder={t('review_name_placeholder', 'Ваше имя')} 
                    value={clientReview.author} onChange={(e: any) => setClientReview({...clientReview, author: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-shadow" 
                  />
                  <select 
                    value={clientReview.rating} onChange={(e: any) => setClientReview({...clientReview, rating: Number(e.target.value)})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-shadow"
                  >
                    <option value="5">5 Звезд ⭐⭐⭐⭐⭐</option>
                    <option value="4">4 Звезды ⭐⭐⭐⭐</option>
                    <option value="3">3 Звезды ⭐⭐⭐</option>
                    <option value="2">2 Звезды ⭐⭐</option>
                    <option value="1">1 Звезда ⭐</option>
                  </select>
                  <textarea 
                    required placeholder={t('review_text_placeholder', 'Поделитесь впечатлениями...')} 
                    value={clientReview.text} onChange={(e: any) => setClientReview({...clientReview, text: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium min-h-[80px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-shadow resize-none"
                  />
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:-translate-y-0.5 transition-all tracking-wider uppercase text-xs mt-2">
                    {t('btn_submit_review', 'Опубликовать')}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="max-w-4xl mx-auto bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl p-8 flex flex-col gap-8">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">{t('contacts_badge', 'Как нас найти')}</span>
              <h2 className="font-serif text-3xl text-slate-900 mt-4 mb-2 font-semibold">{t('contacts_title', 'Контакты и адрес')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6 text-xs text-slate-600 font-medium">
                <div>
                  <h4 className="text-amber-600 font-bold uppercase tracking-wider mb-1">{t('contacts_address_label', 'Адрес клиники')}</h4>
                  <p>ул. Большая Васильковская, 72<br />Киев, Украина, 03150</p>
                </div>
                <div>
                  <h4 className="text-amber-600 font-bold uppercase tracking-wider mb-1">{t('contacts_phone_label', 'Телефон / Мессенджеры')}</h4>
                  <p className="text-slate-900 font-bold">+38 (044) 334-56-78</p>
                  <p>+38 (067) 123-45-67 (Telegram / Viber)</p>
                </div>
                <div>
                  <h4 className="text-amber-600 font-bold uppercase tracking-wider mb-1">{t('contacts_hours_label', 'График работы')}</h4>
                  <p>{t('contacts_hours_value', 'Понедельник — Воскресенье: 10:00 — 20:00 (без выходных)')}</p>
                </div>
              </div>

              <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center relative shadow-inner">
                <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80" alt="Map" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
                  <span className="px-4 py-2 bg-white/95 border border-amber-200 rounded-xl text-xs text-amber-600 font-bold shadow-lg">📍 {t('contacts_map_pin', 'Центр Киева')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 lg:p-10 shadow-2xl shadow-slate-200/50 max-w-5xl mx-auto">
            <div className="pb-6 mb-8 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
              <div>
                <span className="inline-block bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full mb-3 border border-amber-200 uppercase tracking-widest">{t('booking_title', 'Онлайн-запись')}</span>
                <h1 className="text-2xl lg:text-3xl font-serif tracking-tight text-slate-900 font-semibold">{t('booking_subtitle', 'Сформировать визит')}</h1>
              </div>
              {selectedServices.length > 0 && (
                <div className="text-left sm:text-right bg-amber-50 p-3 rounded-xl border border-amber-100 w-max">
                  <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">{t('booking_total', 'Итого (Ориентировочно):')}</div>
                  <div className="text-xl font-bold text-amber-600">{totalDuration} {t('booking_min', 'мин')} / {totalPrice} €</div>
                </div>
              )}
            </div>

            <form onSubmit={handleBookingSubmit} className="flex flex-col gap-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  <span className="text-amber-600">1.</span> {t('booking_step1', 'Выберите процедуры (можно несколько)')}
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[450px] overflow-y-auto p-1 pr-2 custom-scrollbar">
                  {SERVICES.map((service) => {
                    const isSelected = selectedServices.some(s => s.id === service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleServiceSelection(service)}
                        className={`cursor-pointer rounded-xl p-3 border transition-all flex flex-col justify-between h-36 ${
                          isSelected ? 'bg-amber-50 border-amber-500 shadow-md shadow-amber-500/20 ring-1 ring-amber-500' : 'bg-slate-50 border-slate-200 hover:border-amber-300 hover:shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-[8px] uppercase font-bold text-amber-600 tracking-wider truncate w-[80%]">{service.category}</div>
                            {isSelected && <div className="w-3.5 h-3.5 bg-amber-500 rounded-full shrink-0 shadow-sm flex items-center justify-center text-white text-[8px]">✓</div>}
                          </div>
                          <div className="font-serif text-xs text-slate-900 font-bold leading-snug line-clamp-3">{service.title}</div>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-3 text-[10px] font-medium text-slate-500 border-t border-slate-200/50">
                          <span>⏱ {service.duration} {t('booking_min', 'мин')}</span>
                          <span className="font-bold text-slate-900">{service.price} €</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3"><span className="text-amber-600">2.</span> {t('booking_step2', 'Дата и время визита')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <input type="date" required value={selectedDate} onChange={(e: any) => setSelectedDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-shadow" />
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                  {TIME_SLOTS.map((time: string) => {
                    const [h, m] = time.split(':').map(Number);
                    const slotStart = h * 60 + m;
                    const currentDur = totalDuration > 0 ? totalDuration : 1;
                    const slotEnd = slotStart + currentDur;
                    
                    const isBooked = bookedIntervals.some(interval => 
                      Math.max(slotStart, interval.startMins) < Math.min(slotEnd, interval.endMins)
                    );
                    
                    return (
                      <button 
                        type="button" 
                        key={time} 
                        disabled={isBooked}
                        onClick={() => setSelectedTime(time)} 
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          isBooked 
                            ? 'bg-rose-50 border-rose-200 text-rose-400 cursor-not-allowed line-through opacity-60' 
                            : selectedTime === time 
                              ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30' 
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3"><span className="text-amber-600">3.</span> {t('booking_step3', 'Ваши контактные данные')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" required placeholder={`${t('booking_input_firstname', 'Имя')} *`} value={firstName} onChange={(e: any) => setFirstName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-shadow" />
                  <input type="text" required placeholder={`${t('booking_input_lastname', 'Фамилия')} *`} value={lastName} onChange={(e: any) => setLastName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-shadow" />
                  <input type="email" required placeholder="Email *" value={email} onChange={(e: any) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-shadow" />
                  <input type="tel" required placeholder={`${t('booking_input_phone', 'Телефон')} *`} value={phone} onChange={(e: any) => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-shadow" />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-xl shadow-xl shadow-amber-500/30 hover:-translate-y-1 transition-all tracking-wider uppercase text-sm mt-2">
                {t('btn_confirm_booking', 'Подтвердить запись')} {totalDuration > 0 ? `(~${totalDuration} ${t('booking_min', 'мин')})` : ''}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'impressum' && <Impressum onBack={() => setActiveTab('home')} />}
        {activeTab === 'datenschutz' && <Datenschutz onBack={() => setActiveTab('home')} />}

      </main>

      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500 font-medium flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto w-full relative z-10">
        <div>© 2026 Dr. Feier CLINIC. {t('footer_rights', 'Все права защищены.')}</div>
        <div className="flex gap-6 text-slate-400 font-semibold">
          <button onClick={() => setActiveTab('impressum')} className="hover:text-amber-600 transition-colors">Impressum</button>
          <button onClick={() => setActiveTab('datenschutz')} className="hover:text-amber-600 transition-colors">Datenschutz</button>
          <button onClick={() => setActiveTab('admin')} className="hover:text-amber-600 transition-colors ml-4">Admin</button>
        </div>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-amber-500 mb-5 text-3xl font-bold shadow-inner">✓</div>
            <h3 className="font-serif text-2xl text-slate-900 mb-2 font-semibold">{t('modal_success_title', 'Запись успешно оформлена!')}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-8 font-medium">{t('modal_success_desc', 'Спасибо! Наш администратор свяжется с вами в ближайшее время для подтверждения визита.')}</p>
            <button onClick={() => { setShowModal(false); setActiveTab('home'); }} className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20">
              {t('btn_back_home', 'На главную')}
            </button>
          </div>
        </div>
      )}

      {showCookies && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-slate-200 p-6 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-sm font-medium">
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900 mb-2">{t('cookie_title', 'Ihre Privatsphäre ist uns wichtig')}</h3>
              <p className="text-slate-600 leading-relaxed text-xs">
                {t('cookie_text_legal', 'Wir verwenden Cookies und ähnliche Technologien, um die Funktionen unserer Website bereitzustellen und Zugriffe zu analysieren. Sie können alle Cookies akzeptieren oder nur technisch notwendige zulassen. Weitere Details in unserer ')}
                <button onClick={() => setActiveTab('datenschutz')} className="text-amber-600 font-bold underline hover:text-amber-700">{t('cookie_link', 'Datenschutzerklärung')}</button>.
              </p>
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-3 shrink-0 w-full md:w-auto">
              <button 
                onClick={() => handleCookieAction('all')} 
                className="flex-1 md:flex-none px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-amber-500/20 text-xs uppercase tracking-wider"
              >
                {t('cookie_btn_accept', 'Alle akzeptieren')}
              </button>
              <button 
                onClick={() => handleCookieAction('essential')} 
                className="flex-1 md:flex-none px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors text-xs uppercase tracking-wider"
              >
                {t('cookie_btn_reject', 'Nur notwendige')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}